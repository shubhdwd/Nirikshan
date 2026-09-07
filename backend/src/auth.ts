import type { NextFunction, Request, Response } from 'express';
import { admin, clientForToken } from './supabase.js';

export type Role = 'citizen' | 'pcrn_l1' | 'pcrn_l2' | 'pcrn_l3' | 'ngo' | 'hospital' | 'police' | 'admin';
declare global { namespace Express { interface Request { actor?: { id: string; role: Role; token: string }; db?: ReturnType<typeof clientForToken> } } }

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.header('authorization'); if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
    const token = header.slice(7); const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired token' });
    const { data: role } = await admin.from('user_roles').select('role').eq('user_id', data.user.id).eq('is_active', true).eq('approval_status', 'APPROVED').maybeSingle();
    if (!role) return res.status(403).json({ error: 'Account has no active approved role' });
    req.actor = { id: data.user.id, role: role.role as Role, token }; req.db = clientForToken(token); next();
  } catch { res.status(401).json({ error: 'Authentication failed' }); }
}
export const requireRole = (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => req.actor && roles.includes(req.actor.role) ? next() : res.status(403).json({ error: 'Insufficient permissions' });