# NIRIKSHAN backend

Production-oriented Node.js/TypeScript/Express API for the human-verification child welfare workflow. The existing React starter is intentionally untouched.

## Run

```bash
yarn install
yarn build
yarn dev
```

Apply `supabase/migrations/001_nirikshan.sql` in the Supabase SQL editor or through the Supabase CLI. Direct database deployment requires a network-reachable Postgres connection; this environment could reach the Supabase REST/Auth API but could not resolve the direct `db.<project-ref>.supabase.co` hostname. Configure `.env` from `.env.example`; the server secret is never returned to clients. Browse `GET /api/docs` for the endpoint list.

## Security model

Supabase Auth access tokens are validated server-side with `auth.getUser`. Every request gets a bearer-token Supabase client for RLS-scoped reads, while the server-only client is used only for controlled workflow operations and signed private-storage access. Role approval is required for responders and organizations. RLS policies protect citizen ownership and private evidence. No AI, risk scoring, automatic prioritization, or automated verification is included.

## Workflow notes

`route_case(case_id)` matches only approved, active, available responders within their configured radius and creates an offer. The accept/decline endpoint locks an offer atomically by requiring `status='OFFERED'`; declined offers remain in history for fallback routing. Human PCRN verification and Level 2 escalation are explicit endpoints.

## Added operations

- `GET/PUT /api/responders/availability` and `PUT /api/responders/location`
- `GET /api/responders/queue` and `POST /api/cases/:id/assignments/respond`
- `POST /api/cases/:id/intervention`, `POST /api/cases/:id/followup`, and `POST /api/cases/:id/complete`
- `GET/POST /api/organizations`
- `GET /api/admin/users`, `PATCH /api/admin/users/:userId/approval`, `PATCH /api/admin/organizations/:organizationId/approval`
- `GET /api/admin/cases`, `GET /api/admin/audit-logs`, and `GET /api/admin/analytics`