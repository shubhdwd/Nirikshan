/**
 * Demo data seed for NIRIKSHAN.
 * Creates one confirmed user per role, approves responder roles, and seeds availability & locations
 * so that the dynamic routing algorithm can find eligible responders during E2E tests.
 */
import { admin } from '../src/supabase.js';
import { randomBytes } from 'node:crypto';

if (process.env.NODE_ENV === 'production') {
  console.error('Do not run seed script against production');
  process.exit(1);
}

type Role = 'citizen' | 'pcrn_l1' | 'pcrn_l2' | 'ngo' | 'hospital' | 'police' | 'admin';

interface DemoUser {
  email: string;
  password: string;
  role: Role;
  full_name: string;
  mobile: string;
  city: string;
  state: string;
  location?: { latitude: number; longitude: number };
  radius_km?: 1 | 3 | 5 | 10;
}

function generatePassword(): string {
  return randomBytes(16).toString('base64url').slice(0, 20);
}

const nearMumbai = { latitude: 19.076, longitude: 72.8777 };
const nearMumbaiClose = { latitude: 19.078, longitude: 72.879 };
const nearMumbaiMid = { latitude: 19.09, longitude: 72.9 };

const password = generatePassword();

const users: DemoUser[] = [
  { email: 'admin@nirikshan.demo', password, role: 'admin', full_name: 'Nirikshan Admin', mobile: '+911111100000', city: 'Mumbai', state: 'Maharashtra' },
  { email: 'citizen@nirikshan.demo', password, role: 'citizen', full_name: 'Priya Citizen', mobile: '+911111100011', city: 'Mumbai', state: 'Maharashtra' },
  { email: 'pcrn1@nirikshan.demo', password, role: 'pcrn_l1', full_name: 'Ravi PCRN-L1', mobile: '+911111100021', city: 'Mumbai', state: 'Maharashtra', location: nearMumbaiClose, radius_km: 10 },
  { email: 'pcrn1b@nirikshan.demo', password, role: 'pcrn_l1', full_name: 'Anita PCRN-L1', mobile: '+911111100022', city: 'Mumbai', state: 'Maharashtra', location: nearMumbaiMid, radius_km: 10 },
  { email: 'pcrn2@nirikshan.demo', password, role: 'pcrn_l2', full_name: 'Vikram PCRN-L2', mobile: '+911111100031', city: 'Mumbai', state: 'Maharashtra', location: nearMumbaiMid, radius_km: 10 },
  { email: 'ngo@nirikshan.demo', password, role: 'ngo', full_name: 'Nirikshan NGO Officer', mobile: '+911111100041', city: 'Mumbai', state: 'Maharashtra', location: nearMumbai, radius_km: 10 },
  { email: 'hospital@nirikshan.demo', password, role: 'hospital', full_name: 'Nirikshan Hospital Coordinator', mobile: '+911111100051', city: 'Mumbai', state: 'Maharashtra', location: nearMumbai, radius_km: 10 },
  { email: 'police@nirikshan.demo', password, role: 'police', full_name: 'Nirikshan Police Liaison', mobile: '+911111100061', city: 'Mumbai', state: 'Maharashtra', location: nearMumbai, radius_km: 10 },
];

async function upsertOrganizations() {
  const { data, error } = await admin.from('organizations').upsert([
    { name: 'Nirikshan Demo Child Support', organization_type: 'NGO', approval_status: 'APPROVED' },
    { name: 'Nirikshan Demo Medical Unit', organization_type: 'HOSPITAL', approval_status: 'APPROVED' },
    { name: 'Nirikshan Demo Police Precinct', organization_type: 'POLICE', approval_status: 'APPROVED' },
  ], { onConflict: 'name' }).select('id,name,organization_type');
  if (error) throw error;
  return data ?? [];
}

async function findExistingUserId(email: string): Promise<string | null> {
  let page = 1;
  while (page < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (match) return match.id;
    if (data.users.length < 200) return null;
    page += 1;
  }
  return null;
}

async function ensureUser(u: DemoUser): Promise<string> {
  const existing = await findExistingUserId(u.email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing, { password: u.password, email_confirm: true });
    return existing;
  }
  const created = await admin.auth.admin.createUser({ email: u.email, password: u.password, email_confirm: true, user_metadata: { full_name: u.full_name } });
  if (created.error || !created.data.user) throw created.error ?? new Error(`Unable to create ${u.email}`);
  return created.data.user.id;
}

async function ensureProfile(id: string, u: DemoUser) {
  const { error } = await admin.from('profiles').upsert({ id, full_name: u.full_name, mobile_number: u.mobile, city_district: u.city, state: u.state, dob: '1990-01-01' });
  if (error) throw error;
}

async function ensureRole(id: string, u: DemoUser) {
  const { error } = await admin.from('user_roles').upsert({ user_id: id, role: u.role, is_active: true, approval_status: 'APPROVED' });
  if (error) throw error;
}

async function ensureResponderContext(id: string, u: DemoUser, organizationId?: string) {
  if (!u.location) return;
  const rp = await admin.from('responder_profiles').upsert({ user_id: id, response_radius_km: u.radius_km ?? 5, active: true, approved: true, organization_id: organizationId ?? null });
  if (rp.error) throw rp.error;
  const loc = await admin.from('responder_locations').upsert({ responder_id: id, latitude: u.location.latitude, longitude: u.location.longitude, recorded_at: new Date().toISOString() });
  if (loc.error) throw loc.error;
  await admin.from('availability').delete().eq('responder_id', id);
  const av = await admin.from('availability').insert({ responder_id: id, starts_at: new Date(Date.now() - 3600_000).toISOString(), ends_at: new Date(Date.now() + 30 * 24 * 3600_000).toISOString(), available: true });
  if (av.error) throw av.error;
}

async function main() {
  const organizations = await upsertOrganizations();
  const ngoOrg = organizations.find(o => o.organization_type === 'NGO')?.id;
  const hospitalOrg = organizations.find(o => o.organization_type === 'HOSPITAL')?.id;
  const policeOrg = organizations.find(o => o.organization_type === 'POLICE')?.id;

  const report: string[] = [];
  for (const u of users) {
    const id = await ensureUser(u);
    await ensureProfile(id, u);
    await ensureRole(id, u);
    const org = u.role === 'ngo' ? ngoOrg : u.role === 'hospital' ? hospitalOrg : u.role === 'police' ? policeOrg : undefined;
    await ensureResponderContext(id, u, org ?? undefined);
    report.push(`${u.role.padEnd(9)}  ${u.email.padEnd(28)}  password=${u.password}`);
  }
  console.log('Seeded users:\n' + report.join('\n'));
}

main().catch((error) => { console.error('Seed failed:', error); process.exit(1); });
