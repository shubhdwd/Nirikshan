import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { admin } from './supabase.js';
import { env } from './env.js';
import { requireAuth, requireRole } from './auth.js';
import { sanitizeError } from './sanitize-error.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES },
  fileFilter: (_r, f, cb) =>
    cb(
      null,
      ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'].includes(
        f.mimetype,
      ),
    ),
});

const audit = async (
  actor_id: string,
  action: string,
  entity_type: string,
  entity_id: string | null,
  metadata: Record<string, unknown> = {},
) => {
  try {
    await admin
      .from('audit_logs')
      .insert({ actor_id, action, entity_type, entity_id, metadata });
  } catch {
    // Audit logging should not break the main operation
  }
};

const roleToAssistance: Record<string, string> = {
  ngo: 'NGO',
  hospital: 'HOSPITAL',
  police: 'POLICE',
};

router.use(requireAuth);

// ============================================================
// RESPONDER — AVAILABILITY
// ============================================================

router.get(
  '/responders/availability',
  requireRole('pcrn_l1', 'pcrn_l2', 'ngo', 'hospital', 'police'),
  async (req, res) => {
    const { data, error } = await admin
      .from('availability')
      .select('id,starts_at,ends_at,available')
      .eq('responder_id', req.actor!.id)
      .order('starts_at');
    if (error) return res.status(400).json({ error: sanitizeError(error) });
    res.json(data);
  },
);

router.put(
  '/responders/availability',
  requireRole('pcrn_l1', 'pcrn_l2', 'ngo', 'hospital', 'police'),
  async (req, res) => {
    const input = z
      .object({
        starts_at: z.string().datetime(),
        ends_at: z.string().datetime(),
        available: z.boolean().default(true),
      })
      .safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Invalid availability period' });

    const { data, error } = await admin
      .from('availability')
      .insert({ responder_id: req.actor!.id, ...input.data })
      .select('id,starts_at,ends_at,available')
      .single();
    if (error) return res.status(400).json({ error: sanitizeError(error) });
    await audit(req.actor!.id, 'AVAILABILITY_UPDATED', 'responder', req.actor!.id);
    res.status(201).json(data);
  },
);

// ============================================================
// RESPONDER — LOCATION
// ============================================================

router.put(
  '/responders/location',
  requireRole('pcrn_l1', 'pcrn_l2', 'ngo', 'hospital', 'police'),
  async (req, res) => {
    const input = z
      .object({
        latitude: z.number().gte(-90).lte(90),
        longitude: z.number().gte(-180).lte(180),
      })
      .safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Valid coordinates are required' });

    const { data, error } = await admin
      .from('responder_locations')
      .upsert({
        responder_id: req.actor!.id,
        ...input.data,
        recorded_at: new Date().toISOString(),
      })
      .select('responder_id,latitude,longitude,recorded_at')
      .single();
    if (error) return res.status(400).json({ error: sanitizeError(error) });
    await audit(req.actor!.id, 'RESPONDER_LOCATION_UPDATED', 'responder', req.actor!.id);
    res.json(data);
  },
);

// ============================================================
// RESPONDER — QUEUE
// ============================================================

router.get(
  '/responders/queue',
  requireRole('pcrn_l1', 'pcrn_l2', 'ngo', 'hospital', 'police'),
  async (req, res) => {
    const type = roleToAssistance[req.actor!.role];
    let query = admin
      .from('case_assignments')
      .select(
        'id,case_id,assistance_type,distance_km,status,offered_at, cases(case_code,status,emergency_level,location_label,created_at)',
      )
      .eq('responder_id', req.actor!.id)
      .order('offered_at', { ascending: false });
    if (type) query = query.eq('assistance_type', type);
    const { data, error } = await query.limit(100);
    if (error) return res.status(400).json({ error: sanitizeError(error) });
    res.json(data);
  },
);

// ============================================================
// INTERVENTION — NGO / Hospital / Police
// ============================================================

router.post(
  '/cases/:id/intervention',
  requireRole('ngo', 'hospital', 'police'),
  async (req, res) => {
    const caseId = String(req.params.id);
    const type = roleToAssistance[req.actor!.role];
    const input = z
      .object({
        notes: z.string().min(1).max(4000),
        outcome: z.string().max(1000).optional(),
        organization_id: z.string().uuid().optional(),
      })
      .safeParse(req.body);
    if (!input.success)
      return res.status(400).json({ error: 'Intervention notes are required' });

    const permitted = await admin
      .from('case_assistance')
      .select('case_id')
      .eq('case_id', caseId)
      .eq('assistance_type', type)
      .maybeSingle();
    if (!permitted.data)
      return res.status(403).json({ error: 'Case is not relevant to this responder type' });

    const { data, error } = await admin
      .from('case_interventions')
      .insert({ case_id: caseId, updated_by: req.actor!.id, ...input.data })
      .select('id,case_id,notes,outcome,created_at')
      .single();
    if (error) return res.status(400).json({ error: sanitizeError(error) });

    await admin
      .from('cases')
      .update({ status: 'INTERVENTION' })
      .eq('id', caseId)
      .in('status', ['VERIFIED', 'ORG_PENDING', 'INTERVENTION', 'ACCEPTED']);
    await admin.from('case_status_history').insert({
      case_id: caseId,
      status: 'INTERVENTION',
      changed_by: req.actor!.id,
      note: `Intervention update (${type})`,
    });
    await audit(req.actor!.id, 'INTERVENTION_UPDATED', 'case', caseId);
    res.status(201).json(data);
  },
);

// ============================================================
// FOLLOW-UP — NGO
// ============================================================

router.post('/cases/:id/followup', requireRole('ngo'), async (req, res) => {
  const caseId = String(req.params.id);
  const input = z
    .object({
      scheduled_for: z.string().datetime().optional(),
      notes: z.string().min(1).max(4000),
      outcome: z.string().max(1000).optional(),
    })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: 'Follow-up notes are required' });

  const { data, error } = await admin
    .from('case_followups')
    .insert({ case_id: caseId, created_by: req.actor!.id, ...input.data })
    .select('id,case_id,scheduled_for,notes,outcome,created_at')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await admin
    .from('cases')
    .update({ status: 'FOLLOW_UP' })
    .eq('id', caseId)
    .in('status', ['INTERVENTION', 'FOLLOW_UP']);
  await audit(req.actor!.id, 'FOLLOWUP_ADDED', 'case', caseId);
  res.status(201).json(data);
});

// ============================================================
// COMPLETE — NGO / Hospital / Police
// ============================================================

router.post(
  '/cases/:id/complete',
  requireRole('ngo', 'hospital', 'police'),
  async (req, res) => {
    const caseId = String(req.params.id);
    const input = z
      .object({ note: z.string().min(1).max(2000) })
      .safeParse(req.body);
    if (!input.success)
      return res.status(400).json({ error: 'Completion note is required' });

    const { data: caseRow } = await admin
      .from('cases')
      .select('id,status')
      .eq('id', caseId)
      .maybeSingle();
    if (!caseRow) return res.status(404).json({ error: 'Case not found' });
    if (!['INTERVENTION', 'FOLLOW_UP'].includes(caseRow.status))
      return res.status(409).json({ error: 'Case is not ready to close' });

    const { error } = await admin
      .from('cases')
      .update({ status: 'CLOSED' })
      .eq('id', caseId);
    if (error) return res.status(400).json({ error: sanitizeError(error) });

    await admin.from('case_status_history').insert({
      case_id: caseId,
      status: 'CLOSED',
      changed_by: req.actor!.id,
      note: input.data.note,
    });

    // Notify the reporting citizen
    const { data: c } = await admin
      .from('cases')
      .select('reported_by')
      .eq('id', caseId)
      .single();
    if (c) {
      await admin.from('notifications').insert({
        user_id: c.reported_by,
        case_id: caseId,
        title: 'Case closed',
        body: 'Your case has been resolved and closed.',
        type: 'CASE_CLOSED',
      });
    }

    await audit(req.actor!.id, 'CASE_CLOSED', 'case', caseId);
    res.json({ case_id: caseId, status: 'CLOSED' });
  },
);

// ============================================================
// ORGANIZATIONS
// ============================================================

router.get('/organizations', async (req, res) => {
  const query =
    req.actor!.role === 'admin'
      ? admin
          .from('organizations')
          .select('id,name,organization_type,approval_status,created_at')
      : admin
          .from('organizations')
          .select('id,name,organization_type,approval_status,created_at')
          .eq('approval_status', 'APPROVED');
  const { data, error } = await query.order('name');
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

router.post('/organizations', async (req, res) => {
  const input = z
    .object({
      organization_type: z.string().min(2),
      name: z.string().min(2).max(200),
      address: z.string().min(2),
      state_district: z.string().min(2),
      pin_code: z.string().min(4),
      website: z.string().url().optional().or(z.literal('')),
      official_email: z.string().email(),
      official_contact: z.string().min(7),
      legal_details: z.record(z.string()).optional().default({}),
      authorized_rep: z.object({
        name: z.string().min(2),
        designation: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(7),
        id_number: z.string().min(2),
      }),
      case_capabilities: z.array(z.string()).min(1),
      response_availability: z.string().min(1),
      max_response_radius: z.string().min(1),
    })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Invalid organization data', details: input.error.flatten() });

  const { data, error } = await admin
    .from('organizations')
    .insert({
      name: input.data.name,
      organization_type: input.data.organization_type,
      address: input.data.address,
      state_district: input.data.state_district,
      pin_code: input.data.pin_code,
      website: input.data.website || null,
      official_email: input.data.official_email,
      official_contact: input.data.official_contact,
      legal_details: input.data.legal_details,
      authorized_rep_name: input.data.authorized_rep.name,
      authorized_rep_designation: input.data.authorized_rep.designation,
      authorized_rep_email: input.data.authorized_rep.email,
      authorized_rep_phone: input.data.authorized_rep.phone,
      authorized_rep_id: input.data.authorized_rep.id_number,
      case_capabilities: input.data.case_capabilities,
      response_availability: input.data.response_availability,
      max_response_radius: input.data.max_response_radius,
      approval_status: 'PENDING',
    })
    .select('id,name,organization_type,approval_status')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  // If user is authenticated, make them the org admin
  if (req.actor?.id) {
    await admin.from('organization_members').insert({
      organization_id: data.id,
      user_id: req.actor!.id,
      role: 'admin',
      approved: true,
    });
  }

  // Notify admins
  const { data: admins } = await admin
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')
    .eq('is_active', true);

  if (admins && admins.length > 0) {
    await admin.from('notifications').insert(
      admins.map((a) => ({
        user_id: a.user_id,
        title: 'New Organization Registration',
        body: `A new ${input.data.organization_type} has registered as a partner. Verification required.`,
        type: 'ORG_REGISTRATION',
      })),
    );
  }

  await audit(req.actor?.id ?? 'anonymous', 'ORGANIZATION_CREATED', 'organization', data.id);
  res.status(201).json(data);
});

// ============================================================
// PCRN LEVEL 2 — ESCALATION QUEUE
// ============================================================

router.get('/escalations/queue', requireRole('pcrn_l2'), async (req, res) => {
  const { data, error } = await admin
    .from('case_escalations')
    .select(
      'id,case_id,requested_by,reason,status,handled_by,handled_at,created_at,cases(case_code,status,emergency_level,child_description,latitude,longitude,location_label,created_at)',
    )
    .eq('status', 'OPEN')
    .order('created_at', { ascending: true });
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// PCRN LEVEL 2 — MY ESCALATIONS (claimed)
// ============================================================

router.get('/escalations/mine', requireRole('pcrn_l2'), async (req, res) => {
  const { data, error } = await admin
    .from('case_escalations')
    .select(
      'id,case_id,requested_by,reason,status,handled_by,handled_at,created_at,cases(case_code,status,emergency_level,child_description,latitude,longitude,location_label,created_at)',
    )
    .eq('handled_by', req.actor!.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// PCRN LEVEL 2 — CLAIM ESCALATION
// ============================================================

router.post('/escalations/:id/claim', requireRole('pcrn_l2'), async (req, res) => {
  const escalationId = String(req.params.id);

  const { data, error } = await admin
    .from('case_escalations')
    .update({
      handled_by: req.actor!.id,
      status: 'IN_PROGRESS',
    })
    .eq('id', escalationId)
    .eq('status', 'OPEN')
    .select('id,case_id,status,handled_by')
    .single();
  if (error || !data)
    return res.status(409).json({ error: 'Escalation is no longer available or already claimed' });

  // Create a PCRN assignment for the L2 on this case
  const { data: caseRow } = await admin
    .from('cases')
    .select('latitude,longitude')
    .eq('id', data.case_id)
    .single();

  if (caseRow) {
    const { data: respLoc } = await admin
      .from('responder_locations')
      .select('latitude,longitude')
      .eq('responder_id', req.actor!.id)
      .maybeSingle();

    let distance = null;
    if (respLoc) {
      // Calculate distance using the Haversine formula inline (same as DB function)
      const toRad = (d: number) => (d * Math.PI) / 180;
      const lat1 = Number(caseRow.latitude);
      const lon1 = Number(caseRow.longitude);
      const lat2 = Number(respLoc.latitude);
      const lon2 = Number(respLoc.longitude);
      const dlat = toRad(lat2 - lat1);
      const dlon = toRad(lon2 - lon1);
      const h =
        Math.sin(dlat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dlon / 2) ** 2;
      distance = 6371 * 2 * Math.asin(Math.sqrt(h));
    }

    await admin.from('case_assignments').insert({
      case_id: data.case_id,
      responder_id: req.actor!.id,
      assistance_type: 'PCRN',
      distance_km: distance,
      status: 'ACCEPTED',
      responded_at: new Date().toISOString(),
    });
  }

  await admin.from('case_status_history').insert({
    case_id: data.case_id,
    status: 'NEEDS_SUPPORT',
    changed_by: req.actor!.id,
    note: 'Level 2 claimed escalation',
  });

  await audit(req.actor!.id, 'ESCALATION_CLAIMED', 'escalation', escalationId, {
    case_id: data.case_id,
  });
  res.json(data);
});

// ============================================================
// PCRN LEVEL 2 — UPDATE ESCALATION
// ============================================================

router.post('/escalations/:id/update', requireRole('pcrn_l2'), async (req, res) => {
  const escalationId = String(req.params.id);
  const input = z
    .object({ notes: z.string().min(1).max(4000) })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Notes are required' });

  // Verify this L2 is handling this escalation
  const { data: esc } = await admin
    .from('case_escalations')
    .select('id,case_id')
    .eq('id', escalationId)
    .eq('handled_by', req.actor!.id)
    .eq('status', 'IN_PROGRESS')
    .maybeSingle();
  if (!esc)
    return res
      .status(403)
      .json({ error: 'You are not handling this escalation or it is not in progress' });

  await admin.from('case_status_history').insert({
    case_id: esc.case_id,
    status: 'NEEDS_SUPPORT',
    changed_by: req.actor!.id,
    note: `L2 update: ${input.data.notes}`,
  });

  await audit(req.actor!.id, 'ESCALATION_UPDATED', 'escalation', escalationId, {
    case_id: esc.case_id,
  });
  res.json({ escalation_id: escalationId, case_id: esc.case_id, update: 'recorded' });
});

// ============================================================
// PCRN LEVEL 2 — UPLOAD ADDITIONAL EVIDENCE
// ============================================================

router.post(
  '/escalations/:id/evidence',
  requireRole('pcrn_l2'),
  upload.single('file'),
  async (req, res) => {
    const escalationId = String(req.params.id);
    if (!req.file)
      return res.status(400).json({ error: 'Supported image or video file required' });

    // Verify this L2 is handling this escalation
    const { data: esc } = await admin
      .from('case_escalations')
      .select('id,case_id')
      .eq('id', escalationId)
      .eq('handled_by', req.actor!.id)
      .eq('status', 'IN_PROGRESS')
      .maybeSingle();
    if (!esc)
      return res
        .status(403)
        .json({ error: 'You are not handling this escalation or it is not in progress' });

    const path = `${req.actor!.id}/${esc.case_id}/${randomUUID()}`;
    const up = await admin.storage
      .from(env.VERIFICATION_STORAGE_BUCKET)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (up.error) return res.status(400).json({ error: 'Evidence upload failed' });

    const { data, error } = await admin
      .from('verification_evidence')
      .insert({
        case_id: esc.case_id,
        verifier_id: req.actor!.id,
        storage_path: path,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        size_bytes: req.file.size,
      })
      .select('id,created_at')
      .single();

    if (error) {
      await admin.storage.from(env.VERIFICATION_STORAGE_BUCKET).remove([path]);
      return res.status(400).json({ error: sanitizeError(error) });
    }

    await audit(req.actor!.id, 'L2_EVIDENCE_UPLOADED', 'escalation', escalationId, {
      case_id: esc.case_id,
    });
    res.status(201).json(data);
  },
);

// ============================================================
// PCRN LEVEL 2 — RESOLVE ESCALATION
// ============================================================

router.post('/escalations/:id/resolve', requireRole('pcrn_l2'), async (req, res) => {
  const escalationId = String(req.params.id);
  const input = z
    .object({
      resolution: z.enum(['VERIFIED', 'NOT_VERIFIED', 'RETURNED_TO_L1']),
      notes: z.string().min(1).max(4000),
    })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: 'Resolution status and notes are required' });

  // Verify this L2 is handling this escalation
  const { data: esc, error: escErr } = await admin
    .from('case_escalations')
    .update({
      status: 'RESOLVED',
      handled_at: new Date().toISOString(),
    })
    .eq('id', escalationId)
    .eq('handled_by', req.actor!.id)
    .eq('status', 'IN_PROGRESS')
    .select('id,case_id,status')
    .single();
  if (escErr || !esc)
    return res
      .status(409)
      .json({ error: 'Escalation is not in progress or you are not the handler' });

  // Insert a verification record
  await admin.from('case_verifications').insert({
    case_id: esc.case_id,
    verifier_id: req.actor!.id,
    status: input.data.resolution === 'RETURNED_TO_L1' ? 'NEEDS_SUPPORT' : input.data.resolution,
    notes: input.data.notes,
  });

  // Update case status accordingly
  if (input.data.resolution === 'VERIFIED') {
    await admin.from('cases').update({ status: 'VERIFIED' }).eq('id', esc.case_id);
    await admin.from('case_status_history').insert({
      case_id: esc.case_id,
      status: 'VERIFIED',
      changed_by: req.actor!.id,
      note: `L2 resolution: VERIFIED`,
    });

    // Trigger org routing (same as L1 verification path)
    const { data: pendingOrgs } = await admin
      .from('case_assistance')
      .select('assistance_type')
      .eq('case_id', esc.case_id)
      .eq('status', 'PENDING')
      .in('assistance_type', ['NGO', 'HOSPITAL', 'POLICE']);

    if (pendingOrgs && pendingOrgs.length > 0) {
      await admin.rpc('route_org_assistance', { p_case_id: esc.case_id });
      await admin.from('case_status_history').insert({
        case_id: esc.case_id,
        status: 'ORG_PENDING',
        changed_by: req.actor!.id,
        note: `L2 verified. Organization routing initiated.`,
      });
    }
  } else if (input.data.resolution === 'NOT_VERIFIED') {
    await admin.from('cases').update({ status: 'NOT_VERIFIED' }).eq('id', esc.case_id);
    await admin.from('case_status_history').insert({
      case_id: esc.case_id,
      status: 'NOT_VERIFIED',
      changed_by: req.actor!.id,
      note: `L2 resolution: NOT_VERIFIED`,
    });
  } else {
    // RETURNED_TO_L1 — revert to VERIFICATION status
    await admin.from('cases').update({ status: 'VERIFICATION' }).eq('id', esc.case_id);
    await admin.from('case_status_history').insert({
      case_id: esc.case_id,
      status: 'VERIFICATION',
      changed_by: req.actor!.id,
      note: `L2 returned case to Level 1 for further review`,
    });
  }

  await audit(req.actor!.id, 'ESCALATION_RESOLVED', 'escalation', escalationId, {
    case_id: esc.case_id,
    resolution: input.data.resolution,
  });
  res.json({ escalation_id: escalationId, case_id: esc.case_id, resolution: input.data.resolution });
});

// ============================================================
// NGO — LIST PROFESSIONALS (org members)
// ============================================================

router.get(
  '/organizations/:orgId/professionals',
  requireRole('ngo'),
  async (req, res) => {
    const orgId = String(req.params.orgId);

    // Verify caller is a member of this org
    const { data: membership } = await admin
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', orgId)
      .eq('user_id', req.actor!.id)
      .maybeSingle();
    if (!membership)
      return res.status(403).json({ error: 'You are not a member of this organization' });

    const { data, error } = await admin
      .from('organization_members')
      .select(
        'user_id,member_title,approved,created_at,profiles(full_name)',
      )
      .eq('organization_id', orgId)
      .eq('approved', true);
    if (error) return res.status(400).json({ error: sanitizeError(error) });
    res.json(data);
  },
);

// ============================================================
// NGO — ASSIGN PROFESSIONAL TO CASE
// ============================================================

router.post(
  '/cases/:id/assign-professional',
  requireRole('ngo'),
  async (req, res) => {
    const caseId = String(req.params.id);
    const input = z
      .object({
        organization_id: z.string().uuid(),
        professional_user_id: z.string().uuid(),
        notes: z.string().max(2000).optional(),
      })
      .safeParse(req.body);
    if (!input.success)
      return res.status(400).json({ error: 'Invalid assignment data' });

    // Verify caller is a member of this org
    const { data: callerMembership } = await admin
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', input.data.organization_id)
      .eq('user_id', req.actor!.id)
      .maybeSingle();
    if (!callerMembership)
      return res.status(403).json({ error: 'You are not a member of this organization' });

    // Verify the professional is a member of this org
    const { data: profMembership } = await admin
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', input.data.organization_id)
      .eq('user_id', input.data.professional_user_id)
      .eq('approved', true)
      .maybeSingle();
    if (!profMembership)
      return res
        .status(400)
        .json({ error: 'The specified professional is not an approved member of this organization' });

    // Verify the case has an NGO assistance type accepted/pending
    const { data: assist } = await admin
      .from('case_assistance')
      .select('case_id')
      .eq('case_id', caseId)
      .eq('assistance_type', 'NGO')
      .maybeSingle();
    if (!assist)
      return res.status(403).json({ error: 'This case does not have an NGO assistance request' });

    const { data, error } = await admin
      .from('ngo_professional_assignments')
      .insert({
        case_id: caseId,
        organization_id: input.data.organization_id,
        professional_user_id: input.data.professional_user_id,
        assigned_by: req.actor!.id,
        notes: input.data.notes,
      })
      .select('id,case_id,professional_user_id,created_at')
      .single();
    if (error) return res.status(400).json({ error: sanitizeError(error) });

    // Notify the assigned professional
    await admin.from('notifications').insert({
      user_id: input.data.professional_user_id,
      case_id: caseId,
      title: 'Professional assignment',
      body: 'You have been assigned to a child welfare case by your organization.',
      type: 'PROFESSIONAL_ASSIGNMENT',
    });

    await audit(req.actor!.id, 'PROFESSIONAL_ASSIGNED', 'case', caseId, {
      organization_id: input.data.organization_id,
      professional_user_id: input.data.professional_user_id,
    });
    res.status(201).json(data);
  },
);

// ============================================================
// NGO — UPDATE PROFESSIONAL ASSIGNMENT
// ============================================================

router.patch(
  '/cases/:id/assign-professional/:assignmentId',
  requireRole('ngo'),
  async (req, res) => {
    const caseId = String(req.params.id);
    const assignmentId = String(req.params.assignmentId);
    const input = z
      .object({
        professional_user_id: z.string().uuid().optional(),
        notes: z.string().max(2000).optional(),
      })
      .safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Invalid update data' });

    // Get the existing assignment and verify the caller is from the same org
    const { data: existing } = await admin
      .from('ngo_professional_assignments')
      .select('id,organization_id')
      .eq('id', assignmentId)
      .eq('case_id', caseId)
      .maybeSingle();
    if (!existing)
      return res.status(404).json({ error: 'Assignment not found' });

    const { data: callerMember } = await admin
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', existing.organization_id)
      .eq('user_id', req.actor!.id)
      .maybeSingle();
    if (!callerMember)
      return res.status(403).json({ error: 'You are not a member of this organization' });

    // If changing the professional, verify the new one is in the org
    if (input.data.professional_user_id) {
      const { data: newProf } = await admin
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', existing.organization_id)
        .eq('user_id', input.data.professional_user_id)
        .eq('approved', true)
        .maybeSingle();
      if (!newProf)
        return res
          .status(400)
          .json({ error: 'The specified professional is not an approved member of this organization' });
    }

    const updateData: Record<string, unknown> = {};
    if (input.data.professional_user_id)
      updateData.professional_user_id = input.data.professional_user_id;
    if (input.data.notes !== undefined) updateData.notes = input.data.notes;

    const { data, error } = await admin
      .from('ngo_professional_assignments')
      .update(updateData)
      .eq('id', assignmentId)
      .select('id,case_id,professional_user_id,notes,updated_at')
      .single();
    if (error) return res.status(400).json({ error: sanitizeError(error) });

    await audit(req.actor!.id, 'PROFESSIONAL_ASSIGNMENT_UPDATED', 'case', caseId, {
      assignment_id: assignmentId,
    });
    res.json(data);
  },
);

// ============================================================
// CASE — ESCALATION FLOW TRACKING
// ============================================================

router.get('/cases/:id/flow', requireAuth, async (req, res) => {
  const caseId = String(req.params.id);

  // Verify user is involved in this case (reporter, responder, escalation handler, or admin)
  const { data: caseRecord } = await admin
    .from('cases')
    .select('reported_by')
    .eq('id', caseId)
    .maybeSingle();
  if (!caseRecord) return res.status(404).json({ error: 'Case not found' });

  const [{ data: isAssigned }, { data: isEscalationHandler }] = await Promise.all([
    admin
      .from('case_assignments')
      .select('id')
      .eq('case_id', caseId)
      .eq('responder_id', req.actor!.id)
      .maybeSingle(),
    admin
      .from('case_escalations')
      .select('id')
      .eq('case_id', caseId)
      .eq('handled_by', req.actor!.id)
      .maybeSingle(),
  ]);

  const isInvolved =
    req.actor!.role === 'admin' ||
    caseRecord.reported_by === req.actor!.id ||
    !!isAssigned ||
    !!isEscalationHandler;
  if (!isInvolved) return res.status(403).json({ error: 'Insufficient permissions' });

  // Get escalation history
  const { data: escalations, error } = await admin
    .from('case_escalations')
    .select('id,requested_by,reason,status,handled_by,handled_at,created_at')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  // Build the flow array based on escalation chain
  const flow: string[] = [];
  const updates: Array<{ at: string; by: string; text: string }> = [];

  for (const esc of escalations ?? []) {
    // Determine which level requested
    const { data: reqUser } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', esc.requested_by)
      .maybeSingle();
    const reqRole = reqUser?.role ?? 'citizen';
    const level = reqRole === 'pcrn_l1' ? 'l1' : reqRole === 'pcrn_l2' ? 'l2' : reqRole === 'pcrn_l3' ? 'l3' : reqRole;

    if (!flow.includes(level)) flow.push(level);

    // Add update entry
    let byLabel = level;
    if (reqUser) {
      const { data: profile } = await admin
        .from('profiles')
        .select('full_name')
        .eq('id', esc.requested_by)
        .maybeSingle();
      byLabel = `${level.charAt(0).toUpperCase() + level.slice(1)} · ${profile?.full_name ?? 'Unknown'}`;
    }

    updates.push({
      at: esc.created_at,
      by: byLabel,
      text: esc.reason,
    });

    // If resolved, add resolution update
    if (esc.status === 'RESOLVED' && esc.handled_at) {
      const { data: handlerProfile } = await admin
        .from('profiles')
        .select('full_name')
        .eq('id', esc.handled_by!)
        .maybeSingle();
      updates.push({
        at: esc.handled_at,
        by: `Level 2 · ${handlerProfile?.full_name ?? 'Unknown'}`,
        text: 'Escalation resolved',
      });
    }
  }

  // Determine current level
  let current = 'l1';
  if (flow.includes('l3')) current = 'l3';
  else if (flow.includes('l2')) current = 'l2';
  else if (flow.includes('l1')) current = 'l1';

  res.json({ flow, current, updates });
});

// ============================================================
// NGO — PIPELINE STATUS FOR A CASE
// ============================================================

router.get(
  '/cases/:id/ngo-pipeline',
  requireRole('ngo'),
  async (req, res) => {
    const caseId = String(req.params.id);

    // Get all status history for this case to build pipeline
    const { data: history, error } = await admin
      .from('case_status_history')
      .select('status,note,created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: true });
    if (error) return res.status(400).json({ error: sanitizeError(error) });

    // Build pipeline stages from history
    const pipeline = [
      { key: 'referred', label: 'Referred', at: null as string | null, state: 'pending' as string },
      { key: 'accepted', label: 'Accepted', at: null as string | null, state: 'pending' as string },
      { key: 'assigned', label: 'Assigned', at: null as string | null, state: 'pending' as string },
      { key: 'intervention', label: 'Intervention', at: null as string | null, state: 'pending' as string },
      { key: 'follow_up', label: 'Follow-up', at: null as string | null, state: 'pending' as string },
      { key: 'completed', label: 'Completed', at: null as string | null, state: 'pending' as string },
    ];

    const statusMap: Record<string, string> = {
      ORG_PENDING: 'referred',
      ACCEPTED: 'accepted',
      INTERVENTION: 'intervention',
      FOLLOW_UP: 'follow_up',
      CLOSED: 'completed',
    };

    let current = '';
    for (const h of history ?? []) {
      const stageKey = statusMap[h.status];
      if (stageKey) {
        const stage = pipeline.find((p) => p.key === stageKey);
        if (stage) {
          stage.at = h.created_at;
          stage.state = 'complete';
        }
      }
    }

    // Determine current stage
    for (let i = pipeline.length - 1; i >= 0; i--) {
      if (pipeline[i].state === 'complete') {
        current = pipeline[i].key;
        break;
      }
    }

    // Mark stages after current as pending, current as current
    let foundCurrent = false;
    for (const p of pipeline) {
      if (p.key === current) {
        p.state = 'current';
        foundCurrent = true;
      } else if (!foundCurrent && p.state !== 'complete') {
        // Already pending
      }
    }

    res.json({ pipeline, current });
  },
);

// ============================================================
// NGO — AREAS SERVED
// ============================================================

router.get('/ngo/areas', requireRole('ngo'), async (req, res) => {
  const userId = req.actor!.id;

  const { data: membership } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('approved', true)
    .maybeSingle();
  if (!membership) return res.json([]);

  const { data, error } = await admin
    .from('ngo_areas_served')
    .select('id,area_name')
    .eq('organization_id', membership.organization_id)
    .order('area_name');
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

router.post('/ngo/areas', requireRole('ngo'), async (req, res) => {
  const userId = req.actor!.id;
  const input = z
    .object({ area_name: z.string().min(1).max(200) })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Area name is required' });

  const { data: membership } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('approved', true)
    .maybeSingle();
  if (!membership)
    return res.status(403).json({ error: 'You are not a member of any organization' });

  const { data, error } = await admin
    .from('ngo_areas_served')
    .upsert(
      { organization_id: membership.organization_id, area_name: input.data.area_name },
      { onConflict: 'organization_id,area_name' },
    )
    .select('id,area_name')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.status(201).json(data);
});

// ============================================================
// TRAINING — LIST MODULES
// ============================================================

router.get('/training/modules', async (req, res) => {
  const role = req.actor!.role;
  const { data, error } = await admin
    .from('training_modules')
    .select('id,title,description')
    .or(`role_filter.eq.${role},role_filter.eq.all`);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// TRAINING — MODULE DETAIL
// ============================================================

router.get('/training/modules/:moduleId', async (req, res) => {
  const moduleId = String(req.params.moduleId);

  const { data, error } = await admin
    .from('training_modules')
    .select('id,title,description,content,role_filter,duration_minutes,created_at')
    .eq('id', moduleId)
    .maybeSingle();
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  if (!data) return res.status(404).json({ error: 'Training module not found' });

  // Get user progress for this module
  const { data: progress } = await admin
    .from('user_training_progress')
    .select('status,completed_at')
    .eq('user_id', req.actor!.id)
    .eq('module_id', moduleId)
    .maybeSingle();

  res.json({
    ...data,
    progress: progress ?? { status: 'pending', completed_at: null },
  });
});

router.get('/training/progress', async (req, res) => {
  const userId = req.actor!.id;
  const { data, error } = await admin
    .from('user_training_progress')
    .select('module_id,status,completed_at')
    .eq('user_id', userId);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

router.post('/training/progress', async (req, res) => {
  const userId = req.actor!.id;
  const input = z
    .object({
      module_id: z.string().uuid(),
      status: z.enum(['pending', 'in_progress', 'completed']),
    })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Invalid training progress data' });

  const { data, error } = await admin
    .from('user_training_progress')
    .upsert(
      {
        user_id: userId,
        module_id: input.data.module_id,
        status: input.data.status,
        completed_at: input.data.status === 'completed' ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,module_id' },
    )
    .select('module_id,status,completed_at')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.status(201).json(data);
});

// ============================================================
// CREDENTIALS / RECOGNITION — LIST
// ============================================================

router.get('/credentials', async (req, res) => {
  const userId = req.actor!.id;
  const { data, error } = await admin
    .from('user_credentials')
    .select('id,credential_type,title,note,tone,status,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// ADMIN — USERS
// ============================================================

router.get('/admin/users', requireRole('admin'), async (_req, res) => {
  const { data, error } = await admin
    .from('user_roles')
    .select('user_id,role,is_active,approval_status,approved_by,approved_at,created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

router.patch('/admin/users/:userId/approval', requireRole('admin'), async (req, res) => {
  const userId = String(req.params.userId);
  const input = z
    .object({
      role: z.enum(['pcrn_l1', 'pcrn_l2', 'ngo', 'hospital', 'police']),
      approval_status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
      is_active: z.boolean().default(true),
    })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Invalid approval decision' });

  const { data, error } = await admin
    .from('user_roles')
    .update({
      ...input.data,
      approved_by: req.actor!.id,
      approved_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('user_id,role,is_active,approval_status,approved_at')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await admin.from('responder_profiles').upsert({
    user_id: userId,
    approved: input.data.approval_status === 'APPROVED',
    active: input.data.is_active,
  });

  await audit(req.actor!.id, 'USER_ROLE_APPROVED', 'user', userId, input.data);
  res.json(data);
});

// ============================================================
// ADMIN — ORGANIZATION APPROVAL
// ============================================================

router.patch(
  '/admin/organizations/:organizationId/approval',
  requireRole('admin'),
  async (req, res) => {
    const organizationId = String(req.params.organizationId);
    const input = z
      .object({
        approval_status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED']),
      })
      .safeParse(req.body);
    if (!input.success)
      return res.status(400).json({ error: 'Invalid organization decision' });

    const { data, error } = await admin
      .from('organizations')
      .update({
        approval_status: input.data.approval_status,
        approved_by: req.actor!.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', organizationId)
      .select('id,name,organization_type,approval_status')
      .single();
    if (error) return res.status(400).json({ error: sanitizeError(error) });

    await audit(req.actor!.id, 'ORGANIZATION_APPROVED', 'organization', organizationId, input.data);
    res.json(data);
  },
);

// ============================================================
// ADMIN — CASES
// ============================================================

router.get('/admin/cases', requireRole('admin'), async (req, res) => {
  const status =
    typeof req.query.status === 'string' ? req.query.status : undefined;
  let query = admin
    .from('cases')
    .select('id,case_code,status,emergency_level,location_label,created_at,updated_at')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query.limit(500);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// ADMIN — CREATE CASE MANUALLY
// ============================================================

router.post('/admin/cases', requireRole('admin'), async (req, res) => {
  const input = z
    .object({
      child_description: z.string().min(10).max(5000),
      latitude: z.number().gte(-90).lte(90),
      longitude: z.number().gte(-180).lte(180),
      location_label: z.string().max(300).optional(),
      emergency_level: z.enum(['STANDARD', 'URGENT', 'IMMEDIATE']).default('STANDARD'),
      assistance_types: z.array(z.enum(['PCRN', 'NGO', 'HOSPITAL', 'POLICE'])).min(1),
      assistance_notes: z.string().max(2000).optional(),
      reported_by: z.string().uuid().optional(),
    })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: 'Invalid case data', details: input.error.flatten() });

  const reporterId = input.data.reported_by || req.actor!.id;

  const { data: c, error } = await admin
    .from('cases')
    .insert({
      reported_by: reporterId,
      child_description: input.data.child_description,
      latitude: input.data.latitude,
      longitude: input.data.longitude,
      location_label: input.data.location_label,
      emergency_level: input.data.emergency_level,
      status: 'PENDING_ROUTING',
    })
    .select('id,case_code,status,created_at')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await admin.from('case_assistance').insert(
    input.data.assistance_types.map((assistance_type) => ({
      case_id: c.id,
      assistance_type,
      notes: input.data.assistance_notes,
    })),
  );

  await admin.from('case_status_history').insert({
    case_id: c.id,
    status: 'PENDING_ROUTING',
    changed_by: req.actor!.id,
    note: 'Admin-created case',
  });

  await admin.rpc('route_case', { p_case_id: c.id });
  await audit(req.actor!.id, 'ADMIN_CASE_CREATED', 'case', c.id);

  res.status(201).json(c);
});

// ============================================================
// ADMIN — USER SEARCH
// ============================================================

router.get('/admin/users/search', requireRole('admin'), async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  if (!q && !role) return res.status(400).json({ error: 'Provide a search query (q) or role filter' });

  let query = admin
    .from('user_roles')
    .select('user_id,role,is_active,approval_status,created_at');

  if (role) {
    query = query.eq('role', role);
  }

  if (q) {
    const { data: profileMatches } = await admin
      .from('profiles')
      .select('id')
      .or(`full_name.ilike.%${q}%,mobile_number.ilike.%${q}%`)
      .limit(limit);

    const profileIds = (profileMatches ?? []).map((p: { id: string }) => p.id);
    if (profileIds.length > 0) {
      query = query.in('user_id', profileIds);
    } else {
      query = query.eq('user_id', q);
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  const userIds = (data ?? []).map((r) => r.user_id);
  const { data: profiles } = await admin
    .from('profiles')
    .select('id,full_name,mobile_number')
    .in('id', userIds);

  const profileMap = new Map((profiles ?? []).map((p: Record<string, unknown>) => [p.id, p]));
  const enriched = (data ?? []).map((r) => ({
    ...r,
    full_name: profileMap.get(r.user_id)?.full_name ?? null,
    mobile_number: profileMap.get(r.user_id)?.mobile_number ?? null,
  }));

  res.json(enriched);
});

// ============================================================
// ADMIN — USER ROLE MANAGEMENT
// ============================================================

router.post('/admin/users/:userId/roles', requireRole('admin'), async (req, res) => {
  const userId = String(req.params.userId);
  const input = z
    .object({
      role: z.enum(['citizen', 'pcrn_l1', 'pcrn_l2', 'pcrn_l3', 'ngo', 'hospital', 'police', 'admin']),
      approval_status: z.enum(['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING']).default('APPROVED'),
      is_active: z.boolean().default(true),
    })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Invalid role data', details: input.error.flatten() });

  const { data, error } = await admin
    .from('user_roles')
    .upsert(
      {
        user_id: userId,
        role: input.data.role,
        approval_status: input.data.approval_status,
        is_active: input.data.is_active,
        approved_by: req.actor!.id,
        approved_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,role' },
    )
    .select('user_id,role,is_active,approval_status,approved_at')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  if (['pcrn_l1', 'pcrn_l2'].includes(input.data.role)) {
    await admin.from('responder_profiles').upsert({
      user_id: userId,
      approved: input.data.approval_status === 'APPROVED',
      active: input.data.is_active,
    }, { onConflict: 'user_id' });
  }

  await audit(req.actor!.id, 'USER_ROLE_ASSIGNED', 'user', userId, input.data);
  res.json(data);
});

router.delete('/admin/users/:userId/roles/:role', requireRole('admin'), async (req, res) => {
  const userId = String(req.params.userId);
  const role = String(req.params.role);

  const { error } = await admin
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await audit(req.actor!.id, 'USER_ROLE_REVOKED', 'user', userId, { role });
  res.json({ user_id: userId, role, revoked: true });
});

router.get('/admin/users/:userId/roles', requireRole('admin'), async (req, res) => {
  const userId = String(req.params.userId);

  const { data, error } = await admin
    .from('user_roles')
    .select('id,user_id,role,is_active,approval_status,approved_by,approved_at,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// ADMIN — BATCH APPROVAL
// ============================================================

router.post('/admin/users/batch-approval', requireRole('admin'), async (req, res) => {
  const input = z
    .object({
      decisions: z.array(z.object({
        user_id: z.string().uuid(),
        role: z.enum(['pcrn_l1', 'pcrn_l2', 'ngo', 'hospital', 'police']),
        approval_status: z.enum(['APPROVED', 'REJECTED']),
      })).min(1).max(50),
    })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Invalid batch data', details: input.error.flatten() });

  const results = [];
  for (const d of input.data.decisions) {
    const { data, error } = await admin
      .from('user_roles')
      .update({
        approval_status: d.approval_status,
        is_active: d.approval_status === 'APPROVED',
        approved_by: req.actor!.id,
        approved_at: new Date().toISOString(),
      })
      .eq('user_id', d.user_id)
      .eq('role', d.role)
      .eq('approval_status', 'PENDING')
      .select('user_id,role,approval_status')
      .single();

    results.push({
      user_id: d.user_id,
      role: d.role,
      success: !error,
      error: error ? sanitizeError(error) : null,
    });

    if (!error) {
      await admin.from('responder_profiles').upsert({
        user_id: d.user_id,
        approved: d.approval_status === 'APPROVED',
        active: d.approval_status === 'APPROVED',
      }, { onConflict: 'user_id' });
    }
  }

  await audit(req.actor!.id, 'BATCH_APPROVAL', 'user', null, { decisions: input.data.decisions });
  res.json({ results });
});

// ============================================================
// ADMIN — AUDIT LOGS
// ============================================================

router.get('/admin/audit-logs', requireRole('admin'), async (_req, res) => {
  const { data, error } = await admin
    .from('audit_logs')
    .select('id,actor_id,action,entity_type,entity_id,metadata,created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// ADMIN — BASIC ANALYTICS (kept from original)
// ============================================================

router.get('/admin/analytics', requireRole('admin'), async (_req, res) => {
  const [{ data: statuses }, { data: assistance }, { data: verifications }] =
    await Promise.all([
      admin.from('cases').select('status'),
      admin.from('case_assistance').select('assistance_type'),
      admin.from('case_verifications').select('status'),
    ]);
  const count = (rows: unknown[] | null, key: string) =>
    Object.entries(
      (rows ?? []).reduce<Record<string, number>>((a, r) => {
        const k = String((r as Record<string, unknown>)[key]);
        a[k] = (a[k] ?? 0) + 1;
        return a;
      }, {}),
    );
  res.json({
    case_statuses: count(statuses, 'status'),
    assistance_types: count(assistance, 'assistance_type'),
    verification_outcomes: count(verifications, 'status'),
  });
});

export default router;