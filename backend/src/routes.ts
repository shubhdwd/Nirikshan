import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { admin } from './supabase.js';
import { env } from './env.js';
import { requireAuth, requireRole } from './auth.js';
import { authClient } from './supabase.js';
import { sanitizeError } from './sanitize-error.js';

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

const report = z.object({
  child_description: z.string().min(10).max(5000),
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
  location_label: z.string().max(300).optional(),
  emergency_level: z.enum(['STANDARD', 'URGENT', 'IMMEDIATE']).default('STANDARD'),
  assistance_types: z.array(z.enum(['PCRN', 'NGO', 'HOSPITAL', 'POLICE'])).min(1),
  assistance_notes: z.string().max(2000).optional(),
});

const router = Router();

const audit = async (
  actor: string,
  action: string,
  entity: string,
  id: string,
  metadata = {},
) => {
  try {
    await admin
      .from('audit_logs')
      .insert({ actor_id: actor, action, entity_type: entity, entity_id: id, metadata });
  } catch {
    // Audit logging should not break the main operation
  }
};

// ============================================================
// PUBLIC ROUTES
// ============================================================

router.get('/health', (_req, res) =>
  res.json({ ok: true, service: 'nirikshan-api', timestamp: new Date().toISOString() }),
);

router.get('/docs', (_req, res) =>
  res.type('html').send(`<!doctype html><title>NIRIKSHAN API</title>
<style>body{font:16px system-ui;max-width:900px;margin:40px auto;padding:0 20px;color:#17211b}code{background:#eef4ef;padding:3px 6px;border-radius:4px}li{margin:12px 0}</style>
<h1>NIRIKSHAN API</h1>
<p>Human-verification child welfare coordination backend.</p>
<h2>Auth</h2>
<ul>
<li><code>POST /api/auth/register</code> citizen registration</li>
<li><code>POST /api/auth/login</code> email + password login</li>
<li><code>POST /api/auth/logout</code> end session</li>
<li><code>POST /api/auth/refresh</code> refresh access token</li>
<li><code>POST /api/auth/password-reset</code> send reset email</li>
<li><code>POST /api/auth/password-reset/confirm</code> confirm new password</li>
<li><code>GET /api/auth/google</code> Google OAuth redirect</li>
</ul>
<h2>Cases</h2>
<ul>
<li><code>GET /api/cases</code> list cases (role-filtered)</li>
<li><code>POST /api/cases</code> create case (citizen)</li>
<li><code>GET /api/cases/:id</code> get case (field-projected by role)</li>
<li><code>PATCH /api/cases/:id</code> update case details</li>
<li><code>DELETE /api/cases/:id</code> delete case (citizen, pending only)</li>
<li><code>GET /api/cases/search</code> search cases (admin/L1/L2)</li>
<li><code>POST /api/cases/:id/assignments/respond</code> accept or decline</li>
<li><code>POST /api/cases/:id/verification</code> PCRN human verification</li>
<li><code>POST /api/cases/:id/escalations</code> request Level 2 support</li>
<li><code>POST /api/cases/:id/emergency-flag</code> flag emergency</li>
<li><code>POST /api/cases/:id/evidence</code> citizen evidence upload</li>
<li><code>POST /api/cases/:id/verification-evidence</code> PCRN verification evidence</li>
<li><code>GET /api/cases/:id/verification-evidence</code> list verification evidence</li>
<li><code>GET /api/cases/:id/chat</code> per-case chat messages</li>
<li><code>POST /api/cases/:id/chat</code> send chat message</li>
<li><code>GET /api/cases/:id/flow</code> escalation flow tracking</li>
</ul>
<h2>Profile</h2>
<ul>
<li><code>GET /api/profile</code> current user profile</li>
<li><code>PATCH /api/profile</code> update profile fields</li>
<li><code>POST /api/profile/avatar</code> upload avatar image</li>
<li><code>DELETE /api/profile/avatar</code> remove avatar</li>
</ul>
<h2>Notifications</h2>
<ul>
<li><code>GET /api/notifications</code> list notifications</li>
<li><code>PATCH /api/notifications/:id/read</code> mark single read</li>
<li><code>PATCH /api/notifications/read-all</code> mark all read</li>
<li><code>GET /api/notifications/preferences</code> get preferences</li>
<li><code>POST /api/notifications/preferences</code> update preferences</li>
</ul>
<h2>Dashboard</h2>
<ul>
<li><code>GET /api/dashboard/citizen</code> citizen metrics</li>
<li><code>GET /api/dashboard/l1</code> L1 responder metrics</li>
<li><code>GET /api/dashboard/l2</code> L2 responder metrics</li>
<li><code>GET /api/dashboard/ngo</code> NGO metrics</li>
</ul>
<h2>Workflows</h2>
<ul>
<li><code>GET /api/responders/queue</code> responder assignment queue</li>
<li><code>GET /api/responders/availability</code> availability schedule</li>
<li><code>PUT /api/responders/availability</code> update availability</li>
<li><code>PUT /api/responders/location</code> update responder location</li>
<li><code>POST /api/cases/:id/intervention</code> NGO intervention notes</li>
<li><code>POST /api/cases/:id/followup</code> NGO follow-up</li>
<li><code>POST /api/cases/:id/complete</code> close case</li>
<li><code>POST /api/cases/:id/assign-professional</code> NGO assign professional</li>
<li><code>PATCH /api/cases/:id/assign-professional/:assignmentId</code> update assignment</li>
<li><code>GET /api/cases/:id/ngo-pipeline</code> NGO pipeline status</li>
<li><code>GET /api/escalations/queue</code> L2 escalation queue</li>
<li><code>GET /api/escalations/mine</code> L2 claimed escalations</li>
<li><code>POST /api/escalations/:id/claim</code> claim escalation</li>
<li><code>POST /api/escalations/:id/update</code> update escalation</li>
<li><code>POST /api/escalations/:id/evidence</code> L2 evidence upload</li>
<li><code>POST /api/escalations/:id/resolve</code> resolve escalation</li>
<li><code>GET /api/organizations</code> list organizations</li>
<li><code>POST /api/organizations</code> register organization</li>
<li><code>GET /api/organizations/:orgId/professionals</code> list org members</li>
<li><code>GET /api/ngo/areas</code> NGO areas served</li>
<li><code>POST /api/ngo/areas</code> add NGO area</li>
</ul>
<h2>Training & Credentials</h2>
<ul>
<li><code>GET /api/training/modules</code> training modules</li>
<li><code>GET /api/training/modules/:id</code> module detail + progress</li>
<li><code>GET /api/training/progress</code> user training progress</li>
<li><code>POST /api/training/progress</code> update training progress</li>
<li><code>GET /api/credentials</code> user credentials/recognition</li>
</ul>
<h2>Chat</h2>
<ul>
<li><code>GET /api/cases/:id/chat</code> list messages</li>
<li><code>POST /api/cases/:id/chat</code> send message</li>
<li><code>GET /api/chat/quick-replies</code> role-specific canned responses</li>
</ul>
<h2>L1/L2 Registration</h2>
<ul>
<li><code>POST /api/l1/register</code> citizen L1 application</li>
<li><code>POST /api/l2/register</code> L1→L2 certification application</li>
</ul>
<h2>Admin</h2>
<ul>
<li><code>GET /api/admin/overview</code> system aggregates</li>
<li><code>GET /api/admin/cases</code> all cases</li>
<li><code>POST /api/admin/cases</code> create case manually</li>
<li><code>GET /api/admin/users</code> all user roles</li>
<li><code>GET /api/admin/users/search</code> search users</li>
<li><code>POST /api/admin/users/:userId/roles</code> assign role</li>
<li><code>GET /api/admin/users/:userId/roles</code> list user roles</li>
<li><code>DELETE /api/admin/users/:userId/roles/:role</code> revoke role</li>
<li><code>PATCH /api/admin/users/:userId/approval</code> approve/reject</li>
<li><code>POST /api/admin/users/batch-approval</code> batch approve/reject</li>
<li><code>PATCH /api/admin/organizations/:id/approval</code> org approval</li>
<li><code>GET /api/admin/audit-logs</code> audit trail</li>
<li><code>GET /api/admin/analytics</code> basic analytics</li>
</ul>
<h2>Analytics (Admin)</h2>
<ul>
<li><code>GET /api/analytics/vulnerability-baseline</code> baseline-normalized detection</li>
<li><code>GET /api/analytics/spatiotemporal-patterns</code> pattern detection</li>
<li><code>GET /api/analytics/corroboration</code> independent corroboration</li>
<li><code>GET /api/analytics/vulnerability-map</code> vulnerability + confidence</li>
<li><code>GET /api/analytics/blind-spots</code> observation blind spots</li>
<li><code>GET /api/analytics/response-times</code> response time analysis</li>
<li><code>GET /api/analytics/intervention-effectiveness</code> intervention impact</li>
<li><code>GET /api/analytics/intervention-displacement</code> displacement analysis</li>
</ul>
<p>All protected endpoints require <code>Authorization: Bearer &lt;Supabase access token&gt;</code>.</p>`),
);

// ============================================================
// AUTH ROUTES
// ============================================================

router.post('/auth/register', async (req, res) => {
  const input = z
    .object({
      full_name: z.string().min(2),
      mobile_number: z.string().min(7),
      email: z.string().email().optional(),
      dob: z.string().min(1),
      city_district: z.string().min(2),
      state: z.string().min(2),
      password: z.string().min(8),
      consent_terms: z.boolean().refine((v) => v === true, { message: 'Terms must be accepted' }),
      consent_reporting: z.boolean().refine((v) => v === true, { message: 'Reporting consent is required' }),
      l1_opt_in: z.boolean().optional().default(false),
    })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: 'Invalid registration data', details: input.error.flatten() });

  // If no email provided, generate a placeholder (user signed up with mobile only)
  const userEmail = input.data.email || `${input.data.mobile_number}@nirikshan.local`;

  const { data, error } = await admin.auth.admin.createUser({
    email: userEmail,
    password: input.data.password,
    email_confirm: !input.data.email,
    user_metadata: { full_name: input.data.full_name },
  });
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  const profile = await admin.from('profiles').insert({
    id: data.user.id,
    full_name: input.data.full_name,
    mobile_number: input.data.mobile_number,
    dob: input.data.dob,
    city_district: input.data.city_district,
    state: input.data.state,
    consent_terms: input.data.consent_terms,
    consent_reporting: input.data.consent_reporting,
  });

  // If L1 opt-in, create as pending L1; otherwise citizen
  const role = await admin.from('user_roles').insert({
    user_id: data.user.id,
    role: 'citizen',
    is_active: true,
    approval_status: 'APPROVED',
  });

  // If L1 opt-in, also create a pending L1 role
  let l1Error = null;
  if (input.data.l1_opt_in) {
    const l1Role = await admin.from('user_roles').insert({
      user_id: data.user.id,
      role: 'pcrn_l1',
      is_active: false,
      approval_status: 'PENDING',
    });
    l1Error = l1Role.error;
  }

  if (profile.error || role.error || l1Error) {
    console.error('Registration rollback:', { profile: profile.error, role: role.error, l1: l1Error });
    await admin.from('profiles').delete().eq('id', data.user.id);
    await admin.from('user_roles').delete().eq('user_id', data.user.id);
    await admin.auth.admin.deleteUser(data.user.id);
    return res.status(500).json({ error: 'Unable to complete registration' });
  }

  const message = input.data.email
    ? 'Registration successful. You can now sign in with your email.'
    : 'Registration successful. You can now sign in with your mobile number.';

  res.status(201).json({ id: data.user.id, message });
});

router.post('/auth/login', async (req, res) => {
  const input = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Email and password are required' });
  const { data, error } = await authClient.auth.signInWithPassword(input.data);
  if (error || !data.session) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: { id: data.user.id, email: data.user.email },
  });
});

router.post('/auth/logout', requireAuth, async (_req, res) => res.status(204).end());

router.post('/auth/password-reset', async (req, res) => {
  const input = z
    .object({ email: z.string().email(), redirect_to: z.string().url() })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: 'Valid email and redirect_to are required' });
  const allowedDomains = [env.SUPABASE_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];
  let safeRedirect = `${env.SUPABASE_URL}/auth/v1/verify`;
  try {
    const url = new URL(input.data.redirect_to);
    if (allowedDomains.some(d => url.origin === new URL(d).origin)) {
      safeRedirect = input.data.redirect_to;
    }
  } catch { /* invalid URL, use fallback */ }
  const { error } = await authClient.auth.resetPasswordForEmail(input.data.email, {
    redirectTo: safeRedirect,
  });
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json({ message: 'If the account exists, a password reset email has been sent.' });
});

router.get('/auth/google', async (req, res) => {
  const redirectTo =
    typeof req.query.redirect_to === 'string' ? req.query.redirect_to : undefined;
  const safeRedirect = redirectTo && redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/';
  const { data, error } = await authClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: safeRedirect },
  });
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json({ url: data.url });
});

// ============================================================
// AUTH — REFRESH TOKEN
// ============================================================

router.post('/auth/refresh', async (req, res) => {
  const input = z
    .object({ refresh_token: z.string().min(1) })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Refresh token is required' });

  const { data, error } = await authClient.auth.refreshSession({
    refresh_token: input.data.refresh_token,
  });
  if (error || !data.session) return res.status(401).json({ error: 'Invalid or expired refresh token' });

  res.json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user: { id: data.user?.id, email: data.user?.email },
  });
});

// ============================================================
// AUTH — CONFIRM PASSWORD RESET
// ============================================================

router.post('/auth/password-reset/confirm', async (req, res) => {
  const input = z
    .object({ access_token: z.string().min(1), refresh_token: z.string().min(1), password: z.string().min(8) })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Token and new password are required' });

  const { data: sessionData, error: sessionErr } = await authClient.auth.setSession({
    access_token: input.data.access_token,
    refresh_token: input.data.refresh_token,
  });
  if (sessionErr || !sessionData.session) return res.status(401).json({ error: 'Invalid or expired reset token' });

  const { error } = await authClient.auth.updateUser({ password: input.data.password });
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  res.json({ message: 'Password updated successfully. You can now sign in with your new password.' });
});

// ============================================================
// AUTH MIDDLEWARE (all routes below require auth except /auth/*)
// ============================================================

router.use((req, res, next) =>
  req.path.startsWith('/auth/') && req.path !== '/auth/logout'
    ? next()
    : requireAuth(req, res, next),
);

// ============================================================
// L1 REGISTRATION — Verified Citizen Application
// ============================================================

router.post('/l1/register', requireRole('citizen'), async (req, res) => {
  const input = z
    .object({
      id_type: z.enum(['Aadhaar', 'Other Government-Issued ID']),
      id_number: z.string().min(4),
      motivation: z.string().min(2).max(500),
      availability: z.array(z.enum(['Morning', 'Afternoon', 'Evening', 'Night'])).min(1),
      response_radius_km: z.number().min(1).max(50),
      emergency_contact: z.object({
        name: z.string().min(2),
        relationship: z.string().min(2),
        phone: z.string().min(7),
      }),
      code_of_conduct_accepted: z.literal(true),
    })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: 'Invalid L1 registration data', details: input.error.flatten() });

  const userId = req.actor!.id;

  // Check if already has a pending or approved L1 role
  const { data: existing } = await admin
    .from('user_roles')
    .select('user_id,approval_status')
    .eq('user_id', userId)
    .eq('role', 'pcrn_l1')
    .maybeSingle();

  if (existing && existing.approval_status === 'APPROVED') {
    return res.status(409).json({ error: 'You are already a verified L1 responder' });
  }
  if (existing && existing.approval_status === 'PENDING') {
    return res.status(409).json({ error: 'Your L1 application is already pending review' });
  }

  // Upsert the L1 role as pending
  const { error: roleErr } = await admin
    .from('user_roles')
    .upsert(
      { user_id: userId, role: 'pcrn_l1', is_active: false, approval_status: 'PENDING' },
      { onConflict: 'user_id,role' },
    );
  if (roleErr) return res.status(500).json({ error: 'Failed to submit L1 application' });

  // Store responder profile data
  await admin.from('responder_profiles').upsert(
    {
      user_id: userId,
      id_type: input.data.id_type,
      id_number: input.data.id_number,
      motivation: input.data.motivation,
      availability: input.data.availability,
      response_radius_km: input.data.response_radius_km,
      emergency_contact_name: input.data.emergency_contact.name,
      emergency_contact_relationship: input.data.emergency_contact.relationship,
      emergency_contact_phone: input.data.emergency_contact.phone,
    },
    { onConflict: 'user_id' },
  );

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
        title: 'New L1 Application',
        body: `A citizen has applied for Level 1 verification. Review required.`,
        type: 'L1_APPLICATION',
      })),
    );
  }

  await audit(userId, 'L1_APPLICATION_SUBMITTED', 'user', userId);
  res.status(201).json({ message: 'L1 application submitted. A coordinator will review your application.' });
});

// ============================================================
// L2 REGISTRATION — Certified Community Responder
// ============================================================

router.post('/l2/register', requireRole('pcrn_l1'), async (req, res) => {
  const input = z
    .object({
      skills: z.array(z.string()).min(1),
      has_training: z.boolean(),
      training_areas: z.array(z.string()).optional().default([]),
      certification_name: z.string().optional().default(''),
      certification_org: z.string().optional().default(''),
      certification_date: z.string().optional().default(''),
      assessment_score: z.number().min(0).max(100),
      code_of_conduct_accepted: z.literal(true),
    })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: 'Invalid L2 registration data', details: input.error.flatten() });

  // Must have 80% on assessment
  if (input.data.assessment_score < 80) {
    return res.status(400).json({ error: 'Assessment score must be 80% or higher to proceed' });
  }

  const userId = req.actor!.id;

  // Check if already has pending or approved L2
  const { data: existing } = await admin
    .from('user_roles')
    .select('user_id,approval_status')
    .eq('user_id', userId)
    .eq('role', 'pcrn_l2')
    .maybeSingle();

  if (existing && existing.approval_status === 'APPROVED') {
    return res.status(409).json({ error: 'You are already a certified L2 responder' });
  }
  if (existing && existing.approval_status === 'PENDING') {
    return res.status(409).json({ error: 'Your L2 application is already pending review' });
  }

  // Upsert L2 role as pending
  const { error: roleErr } = await admin
    .from('user_roles')
    .upsert(
      { user_id: userId, role: 'pcrn_l2', is_active: false, approval_status: 'PENDING' },
      { onConflict: 'user_id,role' },
    );
  if (roleErr) return res.status(500).json({ error: 'Failed to submit L2 application' });

  // Store L2-specific data in responder_profiles
  await admin.from('responder_profiles').upsert(
    {
      user_id: userId,
      skills: input.data.skills,
      has_training: input.data.has_training,
      training_areas: input.data.training_areas,
      certification_name: input.data.certification_name,
      certification_org: input.data.certification_org,
      certification_date: input.data.certification_date,
      assessment_score: input.data.assessment_score,
    },
    { onConflict: 'user_id' },
  );

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
        title: 'New L2 Application',
        body: `An L1 responder has applied for Level 2 certification. Training and assessment review required.`,
        type: 'L2_APPLICATION',
      })),
    );
  }

  await audit(userId, 'L2_APPLICATION_SUBMITTED', 'user', userId);
  res.status(201).json({ message: 'L2 application submitted. A coordinator will review your training and certification.' });
});

// ============================================================
// CASES — LIST
// ============================================================

router.get('/cases', async (req, res) => {
  const role = req.actor!.role;

  if (role === 'citizen') {
    // Citizen sees ONLY their own cases with limited fields
    const { data, error } = await req
      .db!.from('cases')
      .select('id,case_code,status,emergency_level,location_label,created_at,updated_at')
      .eq('reported_by', req.actor!.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: sanitizeError(error) });
    return res.json(data);
  }

  // Responders see only cases assigned to them via case_assignments
  const { data: myAssignments, error: assignErr } = await admin
    .from('case_assignments')
    .select('case_id')
    .eq('responder_id', req.actor!.id);
  if (assignErr) return res.status(400).json({ error: sanitizeError(assignErr) });
  const assignedCaseIds = [...new Set((myAssignments ?? []).map((a) => a.case_id))];
  if (assignedCaseIds.length === 0) return res.json([]);

  const q = admin
    .from('cases')
    .select(
      'id,case_code,status,emergency_level,location_label,created_at,updated_at,case_assistance(assistance_type)',
    )
    .in('id', assignedCaseIds)
    .order('created_at', { ascending: false });
  const { data, error } = await q.limit(100);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// CASES — CREATE (PCRN-first routing)
// ============================================================

router.post('/cases', requireRole('citizen'), async (req, res) => {
  const input = report.safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: 'Invalid report', details: input.error.flatten() });

  // Create the case
  const { data: c, error } = await admin
    .from('cases')
    .insert({
      reported_by: req.actor!.id,
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

  // Insert all assistance types (PCRN + any orgs). Orgs stay PENDING until verification.
  const assistance = await admin.from('case_assistance').insert(
    input.data.assistance_types.map((assistance_type) => ({
      case_id: c.id,
      assistance_type,
      notes: input.data.assistance_notes,
    })),
  );

  const history = await admin.from('case_status_history').insert({
    case_id: c.id,
    status: 'PENDING_ROUTING',
    changed_by: req.actor!.id,
  });

  // route_case now only routes PCRN. Org types stay pending.
  const routed =
    assistance.error || history.error
      ? { error: assistance.error ?? history.error }
      : await admin.rpc('route_case', { p_case_id: c.id });

  if (routed.error) {
    await admin.from('case_assistance').delete().eq('case_id', c.id);
    await admin.from('case_status_history').delete().eq('case_id', c.id);
    await admin.from('cases').delete().eq('id', c.id);
    return res.status(502).json({ error: 'Unable to route case; no case was retained' });
  }

  await audit(req.actor!.id, 'CASE_CREATED', 'case', c.id, {
    assistance_types: input.data.assistance_types,
  });

  res.status(201).json({
    ...c,
    emergency_contacts:
      input.data.emergency_level === 'IMMEDIATE'
        ? ['Call local emergency services immediately: 112 (India), 100 (Police), 1098 (Childline)']
        : [],
  });
});

// ============================================================
// CASES — SEARCH (admin only)
// ============================================================

router.get('/cases/search', requireRole('admin', 'pcrn_l1', 'pcrn_l2'), async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  if (!q && !status) return res.status(400).json({ error: 'Provide a search query (q) or status filter' });

  let query = admin
    .from('cases')
    .select('id,case_code,status,emergency_level,location_label,created_at,updated_at');

  if (q) {
    query = query.or(`case_code.ilike.%${q}%,location_label.ilike.%${q}%,child_description.ilike.%${q}%`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// CASES — GET SINGLE (role-based field projection)
// ============================================================

router.get('/cases/:id', async (req, res) => {
  const caseId = String(req.params.id);
  const filterKey = caseId.startsWith('NR-') ? 'case_code' : 'id';
  const role = req.actor!.role;

  if (role === 'citizen') {
    // Citizens see only limited fields, no internal data
    const { data, error } = await req
      .db!.from('cases')
      .select(
        'id,case_code,status,emergency_level,child_description,latitude,longitude,location_label,created_at,updated_at,cannot_call_emergency,case_assistance(assistance_type),case_status_history(status,created_at)',
      )
      .eq(filterKey, caseId)
      .maybeSingle();
    if (error) return res.status(400).json({ error: sanitizeError(error) });
    if (!data) return res.status(404).json({ error: 'Case not found' });
    return res.json(data);
  }

  if (role === 'admin') {
    // Admin sees everything
    const { data, error } = await admin
      .from('cases')
      .select(
        'id,case_code,status,emergency_level,child_description,latitude,longitude,location_label,cannot_call_emergency,reported_by,created_at,updated_at,case_assistance(assistance_type,status,notes),case_status_history(status,changed_by,note,created_at),case_assignments(id,responder_id,assistance_type,distance_km,status,offered_at,responded_at),case_verifications(id,verifier_id,status,notes,created_at),case_escalations(id,requested_by,reason,status,handled_by,handled_at,created_at),case_interventions(id,organization_id,updated_by,notes,outcome,created_at),case_followups(id,created_by,scheduled_for,notes,outcome,created_at)',
      )
      .eq(filterKey, caseId)
      .maybeSingle();
    if (error) return res.status(400).json({ error: sanitizeError(error) });
    if (!data) return res.status(404).json({ error: 'Case not found' });
    return res.json(data);
  }

  // PCRN / Org responders: see case details relevant to their assignment
  const { data, error } = await req
    .db!.from('cases')
    .select(
      'id,case_code,status,emergency_level,child_description,latitude,longitude,location_label,cannot_call_emergency,created_at,updated_at,case_assistance(assistance_type,status),case_status_history(status,created_at)',
    )
    .eq(filterKey, caseId)
    .maybeSingle();
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  if (!data) return res.status(404).json({ error: 'Case not found' });
  res.json(data);
});

// ============================================================
// EVIDENCE — CITIZEN UPLOAD
// ============================================================

router.post('/cases/:id/evidence', upload.single('file'), async (req, res) => {
  const caseId = String(req.params.id);
  if (!req.file)
    return res.status(400).json({ error: 'Supported image or video file required' });

  const { data: own } = await req
    .db!.from('cases')
    .select('id')
    .eq('id', caseId)
    .eq('reported_by', req.actor!.id)
    .maybeSingle();
  if (!own) return res.status(404).json({ error: 'Case not found' });

  const path = `${req.actor!.id}/${caseId}/${randomUUID()}`;
  const up = await admin.storage
    .from(env.STORAGE_BUCKET)
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
  if (up.error) return res.status(400).json({ error: 'Evidence upload failed' });

  const { data, error } = await admin
    .from('case_evidence')
    .insert({
      case_id: caseId,
      storage_path: path,
      original_name: req.file.originalname,
      mime_type: req.file.mimetype,
      size_bytes: req.file.size,
      uploaded_by: req.actor!.id,
    })
    .select('id,created_at')
    .single();
  if (error) {
    await admin.storage.from(env.STORAGE_BUCKET).remove([path]);
    return res.status(400).json({ error: sanitizeError(error) });
  }

  await audit(req.actor!.id, 'EVIDENCE_UPLOADED', 'case', caseId);
  res.status(201).json(data);
});

// ============================================================
// VERIFICATION EVIDENCE — PCRN UPLOAD
// ============================================================

router.post(
  '/cases/:id/verification-evidence',
  requireRole('pcrn_l1', 'pcrn_l2'),
  upload.single('file'),
  async (req, res) => {
    const caseId = String(req.params.id);
    if (!req.file)
      return res.status(400).json({ error: 'Supported image or video file required' });

    // Verify the caller has an accepted PCRN assignment on this case
    const { data: assign } = await admin
      .from('case_assignments')
      .select('id')
      .eq('case_id', caseId)
      .eq('responder_id', req.actor!.id)
      .eq('status', 'ACCEPTED')
      .in('assistance_type', ['PCRN'])
      .maybeSingle();

    // Also allow L2 who is handling an escalation on this case
    const { data: escalation } = await admin
      .from('case_escalations')
      .select('id')
      .eq('case_id', caseId)
      .eq('handled_by', req.actor!.id)
      .eq('status', 'IN_PROGRESS')
      .maybeSingle();

    if (!assign && !escalation)
      return res
        .status(403)
        .json({ error: 'You do not have an accepted assignment or escalation on this case' });

    const path = `${req.actor!.id}/${caseId}/${randomUUID()}`;
    const up = await admin.storage
      .from(env.VERIFICATION_STORAGE_BUCKET)
      .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (up.error) return res.status(400).json({ error: 'Verification evidence upload failed' });

    const { data, error } = await admin
      .from('verification_evidence')
      .insert({
        case_id: caseId,
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

    await audit(req.actor!.id, 'VERIFICATION_EVIDENCE_UPLOADED', 'case', caseId);
    res.status(201).json(data);
  },
);

// ============================================================
// VERIFICATION EVIDENCE — LIST WITH SIGNED URLS (PCRN/Admin only)
// ============================================================

router.get(
  '/cases/:id/verification-evidence',
  requireRole('pcrn_l1', 'pcrn_l2', 'admin'),
  async (req, res) => {
    const caseId = String(req.params.id);

    const { data, error } = await admin
      .from('verification_evidence')
      .select('id,case_id,verifier_id,storage_path,original_name,mime_type,size_bytes,created_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ error: sanitizeError(error) });

    // Generate signed URLs
    const withUrls = await Promise.all(
      (data ?? []).map(async (ev) => {
        const { data: signed } = await admin.storage
          .from(env.VERIFICATION_STORAGE_BUCKET)
          .createSignedUrl(ev.storage_path, env.SIGNED_URL_TTL_SECONDS);
        return { ...ev, signed_url: signed?.signedUrl ?? null };
      }),
    );

    res.json(withUrls);
  },
);

// ============================================================
// ASSIGNMENT RESPONSE — ACCEPT / DECLINE
// ============================================================

router.post(
  '/cases/:id/assignments/respond',
  requireRole('pcrn_l1', 'pcrn_l2', 'ngo', 'hospital', 'police'),
  async (req, res) => {
    const caseId = String(req.params.id);
    const input = z
      .object({
        assignment_id: z.string().uuid(),
        decision: z.enum(['ACCEPTED', 'DECLINED']),
        reason: z.string().max(1000).optional(),
      })
      .safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Invalid assignment response' });

    const { data: a, error } = await admin
      .from('case_assignments')
      .update({
        status: input.data.decision,
        decision_reason: input.data.reason,
        responded_at: new Date().toISOString(),
      })
      .eq('id', input.data.assignment_id)
      .eq('case_id', caseId)
      .eq('responder_id', req.actor!.id)
      .eq('status', 'OFFERED')
      .select('case_id,assistance_type')
      .single();
    if (error || !a)
      return res.status(409).json({ error: 'Assignment is no longer available' });

    if (input.data.decision === 'ACCEPTED') {
      // For PCRN: move to ACCEPTED; for orgs: keep ORG_PENDING or move to ACCEPTED
      const newStatus = a.assistance_type === 'PCRN' ? 'ACCEPTED' : 'ORG_PENDING';
      await admin
        .from('cases')
        .update({ status: newStatus })
        .eq('id', a.case_id)
        .in('status', ['PENDING_ROUTING', 'ROUTING', 'ASSIGNED', 'ORG_PENDING']);
      await admin.from('case_status_history').insert({
        case_id: a.case_id,
        status: newStatus,
        changed_by: req.actor!.id,
        note: `Assignment accepted (${a.assistance_type})`,
      });
      await admin
        .from('case_assistance')
        .update({ status: 'ACCEPTED' })
        .eq('case_id', a.case_id)
        .eq('assistance_type', a.assistance_type);
    } else {
      // Declined — reroute to next eligible responder
      const { data: next } = await admin.rpc('reroute_assistance', {
        p_case_id: a.case_id,
        p_assistance: a.assistance_type,
      });
      await admin.from('case_status_history').insert({
        case_id: a.case_id,
        status: 'ROUTING',
        changed_by: req.actor!.id,
        note: `Declined (${a.assistance_type}); next responder: ${next ?? 'none'}`,
      });
    }

    await audit(req.actor!.id, `ASSIGNMENT_${input.data.decision}`, 'case', a.case_id, {
      assistance_type: a.assistance_type,
    });
    res.json({
      case_id: a.case_id,
      status: input.data.decision,
      assistance_type: a.assistance_type,
    });
  },
);

// ============================================================
// VERIFICATION — PCRN L1 (triggers org routing on VERIFIED)
// ============================================================

router.post('/cases/:id/verification', requireRole('pcrn_l1'), async (req, res) => {
  const caseId = String(req.params.id);
  const input = z
    .object({
      status: z.enum(['VERIFIED', 'NOT_VERIFIED', 'NEEDS_SUPPORT']),
      notes: z.string().min(1).max(4000),
    })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Invalid verification' });

  // Must have an accepted PCRN assignment
  const { data: assign } = await admin
    .from('case_assignments')
    .select('id,status,assistance_type')
    .eq('case_id', caseId)
    .eq('responder_id', req.actor!.id)
    .eq('status', 'ACCEPTED')
    .in('assistance_type', ['PCRN'])
    .maybeSingle();
  if (!assign)
    return res
      .status(403)
      .json({ error: 'You do not have an accepted PCRN assignment on this case' });

  // Insert the verification record
  const { data, error } = await admin
    .from('case_verifications')
    .insert({
      case_id: caseId,
      verifier_id: req.actor!.id,
      status: input.data.status,
      notes: input.data.notes,
    })
    .select('id,status,created_at')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  // Update case status
  const { error: statusErr } = await admin.from('cases').update({ status: input.data.status }).eq('id', caseId);
  if (statusErr) return res.status(500).json({ error: 'Failed to update case status' });
  await admin.from('case_status_history').insert({
    case_id: caseId,
    status: input.data.status,
    changed_by: req.actor!.id,
    note: `Verification: ${input.data.status}`,
  });

  // >>> CRITICAL FIX: If VERIFIED, trigger organization routing <<<
  if (input.data.status === 'VERIFIED') {
    // Check if there are pending org assistance types
    const { data: pendingOrgs } = await admin
      .from('case_assistance')
      .select('assistance_type')
      .eq('case_id', caseId)
      .eq('status', 'PENDING')
      .in('assistance_type', ['NGO', 'HOSPITAL', 'POLICE']);

    if (pendingOrgs && pendingOrgs.length > 0) {
      // Route organizations now
      const orgRouted = await admin.rpc('route_org_assistance', { p_case_id: caseId });
      await admin.from('case_status_history').insert({
        case_id: caseId,
        status: 'ORG_PENDING',
        changed_by: req.actor!.id,
        note: `Verified. Organization routing initiated for: ${pendingOrgs.map((o) => o.assistance_type).join(', ')}`,
      });

      // Notify the reporting citizen
      const { data: caseRow } = await admin
        .from('cases')
        .select('reported_by')
        .eq('id', caseId)
        .single();
      if (caseRow) {
        await admin.from('notifications').insert({
          user_id: caseRow.reported_by,
          case_id: caseId,
          title: 'Case verified',
          body: 'Your case has been verified by a community responder. Appropriate organizations are being notified.',
          type: 'CASE_VERIFIED',
        });
      }
    }
  }

  await audit(req.actor!.id, 'CASE_VERIFIED', 'case', caseId, { status: input.data.status });
  res.status(201).json(data);
});

// ============================================================
// ESCALATION — PCRN L1 requests Level 2 support
// ============================================================

router.post('/cases/:id/escalations', requireRole('pcrn_l1'), async (req, res) => {
  const caseId = String(req.params.id);
  const input = z
    .object({ reason: z.string().min(5).max(2000) })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Reason required' });

  const { data: assign } = await admin
    .from('case_assignments')
    .select('id,status')
    .eq('case_id', caseId)
    .eq('responder_id', req.actor!.id)
    .eq('status', 'ACCEPTED')
    .eq('assistance_type', 'PCRN')
    .maybeSingle();
  if (!assign)
    return res
      .status(403)
      .json({ error: 'You do not have an accepted PCRN assignment on this case' });

  const { data, error } = await admin
    .from('case_escalations')
    .insert({
      case_id: caseId,
      requested_by: req.actor!.id,
      reason: input.data.reason,
      status: 'OPEN',
    })
    .select('id,status,created_at')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  const { error: escalateErr } = await admin.from('cases').update({ status: 'NEEDS_SUPPORT' }).eq('id', caseId);
  if (escalateErr) return res.status(500).json({ error: 'Failed to escalate case' });
  await admin.from('case_status_history').insert({
    case_id: caseId,
    status: 'NEEDS_SUPPORT',
    changed_by: req.actor!.id,
    note: 'Escalated to Level 2',
  });

  // Notify all active L2 responders
  const { data: l2Users } = await admin
    .from('user_roles')
    .select('user_id')
    .eq('role', 'pcrn_l2')
    .eq('is_active', true)
    .eq('approval_status', 'APPROVED');

  if (l2Users && l2Users.length > 0) {
    await admin.from('notifications').insert(
      l2Users.map((u) => ({
        user_id: u.user_id,
        case_id: caseId,
        title: 'Escalation: Level 2 support needed',
        body: `A Level 1 responder needs Level 2 support. Reason: ${input.data.reason.slice(0, 200)}`,
        type: 'ESCALATION',
      })),
    );
  }

  await audit(req.actor!.id, 'CASE_ESCALATED', 'case', caseId);
  res.status(201).json(data);
});

// ============================================================
// EMERGENCY FLAG — citizen cannot call emergency services
// ============================================================

router.post('/cases/:id/emergency-flag', requireRole('citizen'), async (req, res) => {
  const caseId = String(req.params.id);

  // Verify the citizen owns this case
  const { data: caseRow } = await admin
    .from('cases')
    .select('id,reported_by,emergency_level')
    .eq('id', caseId)
    .eq('reported_by', req.actor!.id)
    .maybeSingle();
  if (!caseRow) return res.status(404).json({ error: 'Case not found' });

  // Set the flag
  const { error: flagErr } = await admin
    .from('cases')
    .update({ cannot_call_emergency: true })
    .eq('id', caseId);
  if (flagErr) return res.status(500).json({ error: 'Failed to set emergency flag' });

  // Notify the assigned PCRN responder(s)
  const { data: pcrn } = await admin
    .from('case_assignments')
    .select('responder_id')
    .eq('case_id', caseId)
    .eq('assistance_type', 'PCRN')
    .eq('status', 'ACCEPTED');

  if (pcrn && pcrn.length > 0) {
    await admin.from('notifications').insert(
      pcrn.map((p) => ({
        user_id: p.responder_id,
        case_id: caseId,
        title: 'EMERGENCY: Citizen cannot contact services',
        body: 'The reporting citizen has flagged that they are unable to contact emergency services directly. Immediate action may be required.',
        type: 'EMERGENCY_FLAG',
      })),
    );
  }

  await audit(req.actor!.id, 'EMERGENCY_FLAGGED', 'case', caseId);
  res.json({ case_id: caseId, cannot_call_emergency: true });
});

// ============================================================
// CASES — UPDATE (citizen owner or admin)
// ============================================================

router.patch('/cases/:id', async (req, res) => {
  const caseId = String(req.params.id);
  const role = req.actor!.role;

  const input = z
    .object({
      child_description: z.string().min(10).max(5000).optional(),
      location_label: z.string().max(300).optional(),
      emergency_level: z.enum(['STANDARD', 'URGENT', 'IMMEDIATE']).optional(),
    })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Invalid update data', details: input.error.flatten() });

  // Citizens can only update their own cases, and only in certain statuses
  if (role === 'citizen') {
    const { data: own } = await admin
      .from('cases')
      .select('id,status')
      .eq('id', caseId)
      .eq('reported_by', req.actor!.id)
      .maybeSingle();
    if (!own) return res.status(404).json({ error: 'Case not found' });
    if (!['PENDING_ROUTING', 'ROUTING'].includes(own.status))
      return res.status(409).json({ error: 'Case can no longer be edited' });
  } else if (role !== 'admin') {
    return res.status(403).json({ error: 'Only the case owner or an admin can update a case' });
  }

  const updates: Record<string, string> = {};
  if (input.data.child_description) updates.child_description = input.data.child_description;
  if (input.data.location_label !== undefined) updates.location_label = input.data.location_label;
  if (input.data.emergency_level) updates.emergency_level = input.data.emergency_level;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await admin
    .from('cases')
    .update(updates)
    .eq('id', caseId)
    .select('id,case_code,status,child_description,location_label,emergency_level,updated_at')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await audit(req.actor!.id, 'CASE_UPDATED', 'case', caseId, { fields: Object.keys(updates) });
  res.json(data);
});

// ============================================================
// CASES — DELETE (citizen owner, only pending cases)
// ============================================================

router.delete('/cases/:id', async (req, res) => {
  const caseId = String(req.params.id);
  const role = req.actor!.role;

  if (role !== 'citizen' && role !== 'admin') {
    return res.status(403).json({ error: 'Only the case owner or an admin can delete a case' });
  }

  const { data: caseRow } = await admin
    .from('cases')
    .select('id,status,reported_by')
    .eq('id', caseId)
    .maybeSingle();
  if (!caseRow) return res.status(404).json({ error: 'Case not found' });

  if (role === 'citizen' && caseRow.reported_by !== req.actor!.id) {
    return res.status(403).json({ error: 'You can only delete your own cases' });
  }

  if (!['PENDING_ROUTING', 'ROUTING', 'NOT_VERIFIED'].includes(caseRow.status)) {
    return res.status(409).json({ error: 'Case cannot be deleted in its current status' });
  }

  // Delete related records
  await admin.from('case_assistance').delete().eq('case_id', caseId);
  await admin.from('case_assignments').delete().eq('case_id', caseId);
  await admin.from('case_status_history').delete().eq('case_id', caseId);
  await admin.from('case_evidence').delete().eq('case_id', caseId);

  const { error } = await admin.from('cases').delete().eq('id', caseId);
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await audit(req.actor!.id, 'CASE_DELETED', 'case', caseId);
  res.json({ case_id: caseId, deleted: true });
});

// ============================================================
// NOTIFICATIONS — MARK ALL READ
// ============================================================

router.patch('/notifications/read-all', async (req, res) => {
  const { error } = await req
    .db!.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', req.actor!.id)
    .is('read_at', null);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json({ message: 'All notifications marked as read' });
});

// ============================================================
// NOTIFICATION PREFERENCES
// ============================================================

router.get('/notifications/preferences', async (req, res) => {
  const { data, error } = await admin
    .from('notification_preferences')
    .select('type,enabled')
    .eq('user_id', req.actor!.id);
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  // Return defaults if no preferences set
  const defaults = [
    { type: 'CASE_ROUTED', enabled: true },
    { type: 'CASE_VERIFIED', enabled: true },
    { type: 'CASE_CLOSED', enabled: true },
    { type: 'ESCALATION', enabled: true },
    { type: 'ASSIGNMENT', enabled: true },
    { type: 'EMERGENCY_FLAG', enabled: true },
    { type: 'L1_APPLICATION', enabled: true },
    { type: 'L2_APPLICATION', enabled: true },
    { type: 'ORG_REGISTRATION', enabled: true },
    { type: 'PROFESSIONAL_ASSIGNMENT', enabled: true },
  ];

  if (!data || data.length === 0) return res.json(defaults);

  const prefMap = new Map(data.map((p) => [p.type, p.enabled]));
  const result = defaults.map((d) => ({ type: d.type, enabled: prefMap.get(d.type) ?? d.enabled }));
  res.json(result);
});

router.post('/notifications/preferences', async (req, res) => {
  const input = z
    .object({
      preferences: z.array(z.object({
        type: z.string().min(1),
        enabled: z.boolean(),
      })).min(1),
    })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Invalid preferences data' });

  const userId = req.actor!.id;
  const rows = input.data.preferences.map((p) => ({
    user_id: userId,
    type: p.type,
    enabled: p.enabled,
  }));

  const { error } = await admin
    .from('notification_preferences')
    .upsert(rows, { onConflict: 'user_id,type' });
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await audit(userId, 'NOTIFICATION_PREFS_UPDATED', 'user', userId);
  res.json({ message: 'Notification preferences updated' });
});

// ============================================================
// NOTIFICATIONS
// ============================================================

router.get('/notifications', async (req, res) => {
  const { data, error } = await req
    .db!.from('notifications')
    .select('id,title,body,type,read_at,created_at')
    .eq('user_id', req.actor!.id)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// NOTIFICATIONS — MARK READ
// ============================================================

router.patch('/notifications/:id/read', async (req, res) => {
  const notifId = String(req.params.id);
  const { error } = await req
    .db!.from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notifId)
    .eq('user_id', req.actor!.id)
    .is('read_at', null);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json({ id: notifId, read: true });
});

// ============================================================
// PROFILE — CURRENT USER
// ============================================================

router.get('/profile', async (req, res) => {
  const userId = req.actor!.id;

  const [{ data: profile }, { data: role }, { data: responder }, { data: authUser }] = await Promise.all([
    admin
      .from('profiles')
      .select('id,full_name,mobile_number,dob,city_district,state,created_at')
      .eq('id', userId)
      .maybeSingle(),
    admin
      .from('user_roles')
      .select('role,is_active,approval_status')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle(),
    admin
      .from('responder_profiles')
      .select('organization_id,response_radius_km,active,approved')
      .eq('user_id', userId)
      .maybeSingle(),
    admin.auth.admin.getUserById(userId),
  ]);

  if (!profile) return res.status(404).json({ error: 'Profile not found' });

  // Generate initials from full_name
  const initials = (profile.full_name || '')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  res.json({
    id: profile.id,
    name: profile.full_name,
    initials,
    email: authUser?.user?.email ?? '',
    mobile: profile.mobile_number,
    dob: profile.dob,
    city: profile.city_district,
    state: profile.state,
    joined: profile.created_at,
    role: role?.role ?? 'citizen',
    verified: role?.approval_status === 'APPROVED',
    responder: responder
      ? {
          organization_id: responder.organization_id,
          response_radius_km: responder.response_radius_km,
          active: responder.active,
          approved: responder.approved,
        }
      : null,
  });
});

// ============================================================
// PROFILE — UPDATE
// ============================================================

router.patch('/profile', async (req, res) => {
  const input = z
    .object({
      full_name: z.string().min(2).max(200).optional(),
      mobile_number: z.string().min(7).max(20).optional(),
      dob: z.string().min(1).optional(),
      city_district: z.string().min(2).max(200).optional(),
      state: z.string().min(2).max(200).optional(),
    })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: 'Invalid profile data', details: input.error.flatten() });

  const userId = req.actor!.id;
  const updates: Record<string, string> = {};
  if (input.data.full_name) updates.full_name = input.data.full_name;
  if (input.data.mobile_number) updates.mobile_number = input.data.mobile_number;
  if (input.data.dob) updates.dob = input.data.dob;
  if (input.data.city_district) updates.city_district = input.data.city_district;
  if (input.data.state) updates.state = input.data.state;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const { error } = await req
    .db!.from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await audit(userId, 'PROFILE_UPDATED', 'profile', userId);
  res.json({ message: 'Profile updated successfully' });
});

// ============================================================
// PROFILE — AVATAR UPLOAD
// ============================================================

router.post('/profile/avatar', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Image file required (JPEG, PNG, or WebP)' });

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are allowed' });
  }

  const userId = req.actor!.id;
  const path = `avatars/${userId}/${randomUUID()}`;

  const up = await admin.storage
    .from(env.STORAGE_BUCKET)
    .upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
  if (up.error) return res.status(400).json({ error: 'Avatar upload failed' });

  const { data: signed } = await admin.storage
    .from(env.STORAGE_BUCKET)
    .createSignedUrl(path, 86400);

  // Store the avatar path in the profile
  const { error: updateErr } = await admin
    .from('profiles')
    .update({ avatar_url: path })
    .eq('id', userId);
  if (updateErr) {
    await admin.storage.from(env.STORAGE_BUCKET).remove([path]);
    return res.status(400).json({ error: 'Failed to save avatar' });
  }

  await audit(userId, 'AVATAR_UPDATED', 'profile', userId);
  res.json({ avatar_url: signed?.signedUrl ?? path, storage_path: path });
});

// ============================================================
// PROFILE — DELETE AVATAR
// ============================================================

router.delete('/profile/avatar', async (req, res) => {
  const userId = req.actor!.id;

  const { data: profile } = await admin
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (profile?.avatar_url) {
    await admin.storage.from(env.STORAGE_BUCKET).remove([profile.avatar_url]).catch(() => {});
  }

  const { error } = await admin
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', userId);
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await audit(userId, 'AVATAR_REMOVED', 'profile', userId);
  res.json({ message: 'Avatar removed' });
});

// ============================================================
// DASHBOARD — PER-ROLE METRICS
// ============================================================

router.get('/dashboard/citizen', async (req, res) => {
  const userId = req.actor!.id;

  const [{ count: total }, { count: verified }, { count: closed }, { data: cases }] =
    await Promise.all([
      admin
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('reported_by', userId),
      admin
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('reported_by', userId)
        .in('status', ['VERIFIED', 'ORG_PENDING', 'INTERVENTION', 'FOLLOW_UP', 'CLOSED']),
      admin
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('reported_by', userId)
        .eq('status', 'CLOSED'),
      admin
        .from('cases')
        .select('id,created_at,case_status_history(status,created_at)')
        .eq('reported_by', userId)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

  // Calculate average response time (time from submission to first VERIFIED status)
  let totalResponseMs = 0;
  let responseCount = 0;
  for (const c of cases ?? []) {
    const verifiedEvent = c.case_status_history.find(
      (h: { status: string }) =>
        h.status === 'VERIFIED' || h.status === 'INTERVENTION' || h.status === 'CLOSED',
    );
    if (verifiedEvent) {
      totalResponseMs +=
        new Date(verifiedEvent.created_at).getTime() - new Date(c.created_at).getTime();
      responseCount++;
    }
  }
  const avgResponseMinutes = responseCount
    ? Math.round(totalResponseMs / responseCount / 60000)
    : null;

  res.json({
    submitted: total ?? 0,
    verified: verified ?? 0,
    connected: (verified ?? 0) > 0 ? ((verified ?? 0) / (total ?? 1)) * 100 : 0,
    closed: closed ?? 0,
    avgResponseMinutes,
  });
});

router.get('/dashboard/l1', async (req, res) => {
  const userId = req.actor!.id;

  const [{ count: accepted }, { count: active }, { data: recentAssignments }] =
    await Promise.all([
      admin
        .from('case_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('responder_id', userId)
        .eq('status', 'ACCEPTED'),
      admin
        .from('case_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('responder_id', userId)
        .eq('status', 'ACCEPTED')
        .in('assistance_type', ['PCRN']),
      admin
        .from('case_assignments')
        .select('id,case_id,status,offered_at,responded_at')
        .eq('responder_id', userId)
        .order('offered_at', { ascending: false })
        .limit(50),
    ]);

  let totalResponseMs = 0;
  let responseCount = 0;
  for (const a of recentAssignments ?? []) {
    if (a.responded_at) {
      totalResponseMs += new Date(a.responded_at).getTime() - new Date(a.offered_at).getTime();
      responseCount++;
    }
  }
  const avgResponseMinutes = responseCount
    ? Math.round(totalResponseMs / responseCount / 60000)
    : null;

  res.json({
    accepted: accepted ?? 0,
    active: active ?? 0,
    avgResponseMinutes,
  });
});

router.get('/dashboard/l2', async (req, res) => {
  const userId = req.actor!.id;

  const [{ count: open }, { count: inProgress }, { count: resolved }] = await Promise.all([
    admin
      .from('case_escalations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'OPEN'),
    admin
      .from('case_escalations')
      .select('*', { count: 'exact', head: true })
      .eq('handled_by', userId)
      .eq('status', 'IN_PROGRESS'),
    admin
      .from('case_escalations')
      .select('*', { count: 'exact', head: true })
      .eq('handled_by', userId)
      .eq('status', 'RESOLVED'),
  ]);

  res.json({
    open: open ?? 0,
    inProgress: inProgress ?? 0,
    resolved: resolved ?? 0,
  });
});

router.get('/dashboard/ngo', async (req, res) => {
  const userId = req.actor!.id;

  // Find the user's organization
  const { data: membership } = await admin
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .eq('approved', true)
    .maybeSingle();

  if (!membership) {
    return res.json({
      newReferrals: 0,
      active: 0,
      needsAttention: 0,
      completedThisMonth: 0,
      completedAllTime: 0,
      avgResponse: null,
      areasServed: [],
    });
  }

  const orgId = membership.organization_id;

  const [
    { count: newReferrals },
    { count: active },
    { count: completedAllTime },
    { data: areas },
  ] = await Promise.all([
    admin
      .from('case_assistance')
      .select('*', { count: 'exact', head: true })
      .eq('assistance_type', 'NGO')
      .eq('status', 'PENDING'),
    admin
      .from('case_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('responder_id', userId)
      .eq('status', 'ACCEPTED')
      .eq('assistance_type', 'NGO'),
    admin
      .from('case_interventions')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    admin
      .from('ngo_areas_served')
      .select('area_name')
      .eq('organization_id', orgId),
  ]);

  // Count cases completed this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count: completedThisMonth } = await admin
    .from('case_followups')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', userId)
    .gte('created_at', startOfMonth.toISOString());

  res.json({
    newReferrals: newReferrals ?? 0,
    active: active ?? 0,
    needsAttention: 0,
    completedThisMonth: completedThisMonth ?? 0,
    completedAllTime: completedAllTime ?? 0,
    avgResponse: null,
    areasServed: (areas ?? []).map((a: { area_name: string }) => a.area_name),
  });
});

// ============================================================
// ADMIN — OVERVIEW
// ============================================================

router.get('/admin/overview', requireRole('admin'), async (_req, res) => {
  const [{ count: total }, { count: active }, { count: closed }] = await Promise.all([
    admin.from('cases').select('*', { count: 'exact', head: true }),
    admin
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .not('status', 'in', '(CLOSED,NOT_VERIFIED)'),
    admin
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'CLOSED'),
  ]);
  res.json({
    total_cases: total ?? 0,
    active_cases: active ?? 0,
    resolved_cases: closed ?? 0,
  });
});

export default router;