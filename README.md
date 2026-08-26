<div align="center">

# 🏥 DDU Clinic — Medical ERP Platform

### A complete, compliance-minded clinic management system for the entire campus health service — reception to lab, pharmacy, wards, HR, store and management — in one typed codebase.

Built for the **Dire Dawa University Student Clinic Center**, and white-label ready for any institution.

![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![XState](https://img.shields.io/badge/XState-5-2C3E50)
![License](https://img.shields.io/badge/License-MIT-e0a112)

</div>

---

## What makes it different

This isn't a CRUD admin panel. Three architectural ideas run through the whole product:

1. **A finite-state-machine engine drives every workflow.** Visits, lab orders, prescriptions, referrals, admissions, leave requests, appointments and invoices are each a formal state machine (`src/server/fsm`). The engine is the single authority on *which transition is legal and who may trigger it* — no more status strings scattered across controllers. Machines are declarative **and** mirrored into real XState statecharts (testable, visualizable).

2. **The backend decides what the UI shows (HATEOAS-style affordances).** Every screen asks the server "what can this user do to this record right now?" and renders exactly those actions — nothing more. Change a role or a state, and the buttons/forms change automatically, validated again on the server.

3. **Feature toggles everywhere (Fowler-style).** Release / ops / permission / experiment / **tenant** toggles gate every module and capability, so the same codebase ships as a tailored product per institution. Managed live from **Settings → Feature toggles**.

Plus: **white-label branding** (colours + name, admin-editable, injected as CSS variables), **role-based access control**, an **audit trail** of every state transition, a **command palette (⌘K)**, **dark mode**, and an installable **PWA** that degrades gracefully on flaky campus networks.

---

## Modules

| Area | Highlights |
|---|---|
| **Reception** | SIMS student lookup (pluggable), registration, visit intake & queuing |
| **Triage** | Nurse vitals capture, triage queue |
| **Consultations** | FSM-driven doctor workspace: history, vitals, diagnosis, order labs/meds, refer, admit, complete |
| **Laboratory** | Order worklist, specimen → processing → results, ref-range flags, results routed back to the doctor, test catalog |
| **Pharmacy** | Dispensing with FEFO batch decrement, real batch/expiry inventory, stock movements, valuation, reorder & expiry alerts, suppliers |
| **Wards & admissions** | Bed board with occupancy, admit/settle/discharge/transfer |
| **Referrals** | External-hospital referrals with a printable letter |
| **Appointments** | Day agenda, booking, check-in that spawns a queued visit |
| **Billing & cashier** | Auto-invoice from a visit (consultation + lab + pharmacy), payments, printable receipt, revenue dashboard |
| **HR** | Staff directory, leave workflow with **on-leave login lockout**, attendance, shift roster, leave balances |
| **Store & procurement** | Asset register & assignments, stock requests, purchase orders & goods receipt |
| **Clinical compliance** | Allergy list (with alerts), problem list (ICD-10), immunizations |
| **Documents** | Sick-leave certificate, prescription, referral, lab report & receipt — print-ready with white-label letterhead |
| **Student portal** | Self-service: visit history, documents, sick-leave requests |
| **Reports** | Management analytics — visit trends, throughput, stock value, staffing |
| **Settings** | Feature toggles, appearance/branding, organisation, audit log, security |

---

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions) + **TypeScript**
- **Prisma 6** + **PostgreSQL**
- **XState 5** for the FSM engine
- **Auth.js v5** (credentials: staff email/password, students by ID; JWT sessions; on-leave lockout)
- **Tailwind CSS v4** + a **Radix UI** component kit (self-authored)
- **Serwist** PWA · **Recharts** · **Zod** · **sonner**

---

## Quick start

```bash
# 1. Install
npm install

# 2. Start Postgres (Docker) + create the .env (see .env.example)
npm run db:up            # postgres on localhost:5544
cp .env.example .env     # then set AUTH_SECRET (npx auth secret)

# 3. Schema + demo data
npm run db:push
npm run db:seed

# 4. Run
npm run dev              # http://localhost:3100
```

### Demo accounts — password `password`

| Role | Email |
|---|---|
| Manager / Admin | `manager@clinic.test` |
| Doctor | `doctor@clinic.test` |
| Receptionist | `reception@clinic.test` |
| Nurse | `nurse@clinic.test` |
| Lab technician | `lab@clinic.test` |
| Pharmacist | `pharmacy@clinic.test` |
| HR officer | `hr@clinic.test` |
| Store keeper | `store@clinic.test` |

**Student portal:** ID `DDU/1001/14`, password `student`.

---

## Project structure

```
src/
 ├─ app/
 │   ├─ (app)/           # authenticated staff app (dashboard + every module)
 │   ├─ portal/          # student self-service portal
 │   ├─ print/           # print-optimised documents (no chrome)
 │   ├─ login, student-login, page.tsx (landing)
 │   └─ api/auth/…       # Auth.js route
 ├─ server/
 │   ├─ fsm/             # the FSM engine + one machine per lifecycle
 │   ├─ services/        # domain services (visit, lab, pharmacy, hr, billing, …)
 │   ├─ integrations/    # pluggable SIMS adapter (mock + http)
 │   └─ db.ts, session.ts
 ├─ components/          # ui kit, shell (sidebar/topbar/command palette), widgets
 └─ lib/                 # rbac, features registry, nav, utils
prisma/                  # schema + demo seed
```

---

## Scripts

`npm run dev` · `build` · `start` · `typecheck` · `test` (Vitest) · `db:up` · `db:push` · `db:seed` · `db:reset` · `db:studio`

---

## Security & compliance notes

- Role-based access enforced on the server for every route and transition.
- Every state change is written to an audit trail (`StateTransition` + `AuditLog`).
- On-leave / suspended staff cannot sign in.
- Secrets live only in `.env` (git-ignored). **Rotate any credential that ever entered git history.**

## License

MIT — free to adapt for your own institution.
