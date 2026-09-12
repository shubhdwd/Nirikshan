<div align="center">

# NIRIKSHAN

### Making the Invisible Visible

A community-driven **civic-tech platform** to report and track child safety concerns across India.

**Progressive Web App** · **Mobile-First** · **Multi-Role** · **Real-Time Coordination**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## Overview

Nirikshan is a **Child Welfare Response & Coordination Ecosystem** built for India. Citizens can report children in distress with GPS location and evidence, and a network of trained community responders (PCRN), NGOs, hospitals, and police coordinate to verify and resolve each case — all through **human verification** (no AI/ML case scoring).

The platform follows a strict **escalation hierarchy**: Citizen → Level 1 Responder → Level 2 Coordinator → Level 3 Professional → NGO/Hospital/Police intervention — ensuring every case reaches the right hands at the right time.

---

## Features

### Citizen
- Report a child in distress with **GPS location** + photo/video evidence
- Track case status in real-time
- Flag emergency situations when unable to call services directly
- Upload supplementary evidence at any time

### PCRN Level 1 (First Responder)
- Receive nearby case assignments based on location and availability
- Perform **human ground verification** (VERIFIED / NOT_VERIFIED / NEEDS_SUPPORT)
- Escalate complex cases to Level 2 coordinators
- Per-case coordinator chat

### PCRN Level 2 (Coordinator)
- Manage escalation queue from L1 responders
- Claim and handle escalated cases
- Assign professionals and coordinate multi-agency responses
- Full case workflow with evidence upload

### Level 3 (Professional)
- Handle high-complexity cases escalated from L2
- Access sensitive evidence with audit-logged reveal mechanism
- Assign to cases, update status, coordinate with NGOs
- Case lifecycle management with handoff context

### NGO (Verified Partner)
- Accept/reject case referrals (protected data until acceptance)
- 6-stage intervention flow: Referred → Accepted → Assigned → Intervention → Follow-up → Completed
- Assign professionals, add intervention notes
- Impact analytics (non-identifiable, aggregated)

### Admin
- Approve/reject responder and organization registrations
- System-wide overview dashboard with analytics
- Full audit trail of every action
- User management with role assignment

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 · Tailwind CSS · shadcn/ui · React Router 7 · TanStack Query |
| **Backend API** | Node.js · TypeScript · Express 5 · Zod validation |
| **Database** | Supabase (PostgreSQL) with Row-Level Security |
| **Auth** | Supabase Auth (Email/Password, Google OAuth) |
| **Storage** | Supabase Storage (private buckets with RLS) |
| **Proxy** | Python FastAPI reverse proxy (async httpx) |
| **PWA** | Service Worker · Web App Manifest · Offline caching |
| **Deployment** | Docker · Docker Compose · Nginx |

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend   │────▶│  FastAPI Proxy   │────▶│  Node.js API    │
│  (React PWA) │     │  (port 8080)     │     │  (port 4000)    │
│  served via  │     │  async httpx     │     │  Express + TS   │
│    Nginx     │     │  X-Forwarded-For │     │  Supabase SDK   │
└──────────────┘     └──────────────────┘     └────────┬────────┘
                                                        │
                                                        ▼
                                              ┌─────────────────┐
                                              │    Supabase     │
                                              │  PostgreSQL DB  │
                                              │  Auth + Storage │
                                              │  RLS Policies   │
                                              └─────────────────┘
```

---

## Roles & Access

| Role | Access Level | Description |
|------|-------------|-------------|
| `citizen` | Public + Own Data | Report cases, track status, upload evidence |
| `pcrn_l1` | Assigned Cases | Ground verification, escalation to L2 |
| `pcrn_l2` | Escalations | Handle escalations, coordinate response |
| `pcrn_l3` | Professional | High-complexity case management |
| `ngo` | Interventions | Case interventions, follow-ups, impact |
| `hospital` | Medical | Medical assistance on cases |
| `police` | Law Enforcement | Legal assistance on cases |
| `admin` | Full Access | System administration, approvals, analytics |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- Supabase project (or use the provided config)

### Local Development

```bash
# Clone the repo
git clone https://github.com/shubhdwd/Nirikshan.git
cd Nirikshan

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start backend (port 3000)
cd ../backend
npm run dev

# Start frontend (port 3001) — in a new terminal
cd ../frontend
npm start
```

### Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Frontend** (`frontend/.env`):
```env
PORT=3001
REACT_APP_API_URL=http://127.0.0.1:3000
```

### Docker Deployment

```bash
docker compose up --build
```

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:8080`

---

## Database

Supabase migrations are in `backend/supabase/migrations/`:

| Migration | Purpose |
|-----------|---------|
| `001_nirikshan.sql` | Core schema: cases, assignments, verifications, roles |
| `002_storage_policies.sql` | Private storage buckets with RLS |
| `003_routing_fixes.sql` | Dynamic responder routing functions |
| `004_chat_and_extras.sql` | Per-case coordinator chat |
| `004_fixes_and_analytics.sql` | Bug fixes + analytics views |
| `005_avatar_notification_preferences.sql` | User avatars + notification prefs |
| `006_critical_schema_fixes.sql` | Schema corrections + RLS hardening |

Run migrations via:
```bash
cd backend
npm run seed   # Creates demo accounts
```

---

## Demo Accounts (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nirikshan.demo | *generated at seed* |
| Citizen | citizen@nirikshan.demo | *generated at seed* |
| L1 Responder | pcrn1@nirikshan.demo | *generated at seed* |
| L2 Coordinator | pcrn2@nirikshan.demo | *generated at seed* |
| NGO | ngo@nirikshan.demo | *generated at seed* |
| Hospital | hospital@nirikshan.demo | *generated at seed* |
| Police | police@nirikshan.demo | *generated at seed* |

> After running `npm run seed`, check the terminal output for the generated passwords.

---

## Project Structure

```
Nirikshan/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express app entry
│   │   ├── routes.ts          # All API endpoints
│   │   ├── auth.ts            # Auth middleware
│   │   ├── workflows.ts       # Responder routing, escalations
│   │   ├── analytics.ts       # Analytics endpoints
│   │   ├── chat.ts            # Coordinator chat
│   │   ├── supabase.ts        # Supabase clients
│   │   └── env.ts             # Zod-validated env config
│   ├── scripts/seed.ts        # Demo data seeder
│   ├── supabase/migrations/   # SQL migrations
│   └── server.py              # FastAPI reverse proxy
├── frontend/
│   ├── src/
│   │   ├── pages/             # Route pages (Citizen, L1, L2, L3, NGO)
│   │   ├── components/        # Shared UI components
│   │   ├── context/           # Auth context
│   │   ├── lib/               # API client, utilities
│   │   └── hooks/             # Custom React hooks
│   └── public/
│       ├── manifest.json      # PWA manifest
│       ├── sw.js              # Service worker
│       └── icons/             # App icons (72-512px)
├── Dockerfile                 # Backend Docker build
├── Dockerfile.frontend        # Frontend Docker build
├── docker-compose.yml         # Full stack orchestration
└── nginx.conf                 # SPA routing config
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with care for India's children.**

Made for **Aavishkar 2026**

</div>
