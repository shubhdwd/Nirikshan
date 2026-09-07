/**
 * Sanitizes Supabase/Postgres error messages before sending to clients.
 * Prevents leaking table names, column names, RLS policies, and constraint details.
 */
export function sanitizeError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'An unexpected error occurred';

  const err = error as { code?: string; message?: string; hint?: string; status?: number };
  const code = err.code ?? '';
  const message = (err.message ?? '').toLowerCase();

  // Supabase Auth errors (returned from auth.admin.createUser, signInWithPassword, etc.)
  if (message.includes('user already registered') || message.includes('already been registered'))
    return 'An account with this email already exists';
  if (message.includes('email already') || message.includes('duplicate'))
    return 'An account with this email already exists';
  if (message.includes('invalid email'))
    return 'Please provide a valid email address';
  if (message.includes('password') && message.includes('weak'))
    return 'Password is too weak. Use at least 8 characters with a mix of letters and numbers.';
  if (message.includes('rate limit') || message.includes('too many'))
    return 'Too many attempts. Please try again later.';

  // Postgres class codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
  // 23505 = unique_violation (most common during registration)
  if (code === '23505') return 'An account with this information already exists';
  // 23 = other integrity constraint violations
  if (code.startsWith('23')) return 'Data integrity error. Please check your input.';
  // 42 = syntax error or access rule violation
  if (code.startsWith('42')) return 'Invalid request';
  // 28 = insufficient privilege
  if (code === '28000' || code === '28001') return 'Insufficient privileges';
  // PGRST errors (PostgREST / Supabase)
  if (message.includes('pgrst')) return 'An unexpected error occurred';
  // RLS policy errors
  if (message.includes('row-level security') || message.includes('policy')) return 'Access denied';
  // Generic fallback - never return raw message
  return 'An unexpected error occurred';
}
