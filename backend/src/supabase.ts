import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Service-role client. Bypasses RLS. Never call `.auth.signIn*` on this client;
 * doing so replaces its Authorization header with a user token and breaks RLS-bypass
 * for the rest of the process. Use `authClient` for password sign-ins instead.
 */
export const admin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

/**
 * Dedicated client used only for user authentication (sign-in, password reset, OAuth).
 * A fresh instance so admin-role queries stay unaffected.
 */
export const authClient = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

export const clientForToken = (token: string): SupabaseClient => createClient(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, { auth: { autoRefreshToken: false, persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
