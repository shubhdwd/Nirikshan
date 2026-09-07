import { Router } from 'express';
import { z } from 'zod';
import { admin } from './supabase.js';
import { requireAuth } from './auth.js';
import { sanitizeError } from './sanitize-error.js';

const router = Router();
router.use(requireAuth);

const audit = async (
  actor_id: string,
  action: string,
  entity_type: string,
  entity_id: string,
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

// ============================================================
// CHAT — LIST MESSAGES FOR A CASE
// ============================================================

router.get('/cases/:id/chat', async (req, res) => {
  const caseId = String(req.params.id);

  // Verify the user is a participant (reporter, assigned responder, or escalation handler)
  const [{ data: isReporter }, { data: isAssigned }, { data: isEscalationHandler }] =
    await Promise.all([
      admin
        .from('cases')
        .select('id')
        .eq('id', caseId)
        .eq('reported_by', req.actor!.id)
        .maybeSingle(),
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

  if (!isReporter && !isAssigned && !isEscalationHandler) {
    return res.status(403).json({ error: 'You are not a participant in this case' });
  }

  const { data, error } = await admin
    .from('chat_messages')
    .select('id,case_id,sender_id,role,text,created_at')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) return res.status(400).json({ error: sanitizeError(error) });
  res.json(data);
});

// ============================================================
// CHAT — SEND A MESSAGE
// ============================================================

router.post('/cases/:id/chat', async (req, res) => {
  const caseId = String(req.params.id);
  const input = z
    .object({
      text: z.string().min(1).max(4000),
    })
    .safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Message text is required' });

  // Verify the user is a participant
  const [{ data: caseRow }, { data: isAssigned }, { data: isEscalationHandler }] =
    await Promise.all([
      admin
        .from('cases')
        .select('id,reported_by')
        .eq('id', caseId)
        .maybeSingle(),
      admin
        .from('case_assignments')
        .select('id,assistance_type')
        .eq('case_id', caseId)
        .eq('responder_id', req.actor!.id)
        .eq('status', 'ACCEPTED')
        .maybeSingle(),
      admin
        .from('case_escalations')
        .select('id')
        .eq('case_id', caseId)
        .eq('handled_by', req.actor!.id)
        .eq('status', 'IN_PROGRESS')
        .maybeSingle(),
    ]);

  if (!caseRow) return res.status(404).json({ error: 'Case not found' });

  const isReporter = caseRow.reported_by === req.actor!.id;
  if (!isReporter && !isAssigned && !isEscalationHandler) {
    return res.status(403).json({ error: 'You are not a participant in this case' });
  }

  // Determine the role label for the chat message
  let role = 'citizen';
  if (isReporter) {
    role = 'citizen';
  } else if (isAssigned) {
    // Map assistance type to role
    const typeToRole: Record<string, string> = {
      PCRN: 'coordinator',
      NGO: 'ngo',
      HOSPITAL: 'coordinator',
      POLICE: 'coordinator',
    };
    role = typeToRole[isAssigned!.assistance_type] || 'coordinator';
  } else if (isEscalationHandler) {
    role = 'pcrn_l2';
  }

  const { data, error } = await admin
    .from('chat_messages')
    .insert({
      case_id: caseId,
      sender_id: req.actor!.id,
      role,
      text: input.data.text,
    })
    .select('id,case_id,sender_id,role,text,created_at')
    .single();
  if (error) return res.status(400).json({ error: sanitizeError(error) });

  await audit(req.actor!.id, 'CHAT_MESSAGE_SENT', 'case', caseId);
  res.status(201).json(data);
});

// ============================================================
// CHAT — QUICK REPLIES (role-specific canned responses)
// ============================================================

router.get('/chat/quick-replies', async (req, res) => {
  const role = req.actor!.role;

  const quickReplies: Record<string, string[]> = {
    citizen: [
      'I need help',
      'The child is safe now',
      'I can provide more details',
    ],
    pcrn_l1: [
      'On my way',
      "I've arrived",
      'Child is safe with me',
      'Need additional help',
    ],
    pcrn_l2: [
      'Coordinator, please advise',
      'Escalating to Level 3',
      'Field volunteers en route',
      'Standing by',
    ],
    pcrn_l3: [
      'Professional assessment complete',
      'Recommend case transfer',
      'Follow-up scheduled',
    ],
    ngo: [
      'Intervention started',
      'Follow-up scheduled',
      'Case progressing well',
      'Need additional resources',
    ],
    hospital: [
      'Patient admitted',
      'Medical assessment complete',
      'Discharge planned',
    ],
    police: [
      'Investigation initiated',
      'Report filed',
      'Action taken',
    ],
  };

  res.json(quickReplies[role] || []);
});

export default router;
