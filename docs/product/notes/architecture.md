# DDU Clinic — Architecture & Product Reference Notes

Reference notes for the DDU Clinic platform (package name `ddu-clinic`, version `2.0.0`),
the ERP clinic-management system for the **Dire Dawa University Student Clinic Center**.
Everything below is verified against the source on branch `feature/platform-v2`; file
paths and line numbers are cited so claims can be traced back to code.

> Note on the repo: the top-level folder is named `…-Laravel` and an old Laravel app
> lives under `legacy/`. The **current** product is a from-scratch Next.js/TypeScript
> rebuild — this document describes that rebuild, not the legacy Laravel code.

---

## 1. Tech stack

Source of truth: `package.json`, `next.config.ts`, `prisma/schema.prisma`, `src/auth.ts`,
`src/auth.config.ts`.

| Concern | Choice | Version (from `package.json`) | Evidence |
|---|---|---|---|
| Framework | **Next.js** (App Router) | `next` `16.3.1` | `package.json`; routes under `src/app/**` |
| UI runtime | **React 19** (Server Components + Server Actions) | `react`/`react-dom` `19.2.8` | `package.json`; `"use server"` actions, RSC pages |
| Language | **TypeScript** | `typescript` `^5` | `package.json`; `.ts`/`.tsx` throughout |
| ORM | **Prisma** | `@prisma/client` / `prisma` `^6.19.3` | `prisma/schema.prisma`; `src/server/db.ts` |
| Database | **PostgreSQL** (Neon serverless in prod) | — | `datasource db { provider = "postgresql" }` (`prisma/schema.prisma:14`) |
| State machines | **XState v5** + a bespoke declarative engine | `xstate` `^5.32.5`, `@xstate/react` `^6.1.0` | `src/server/fsm/*` |
| Auth | **Auth.js / NextAuth v5 (beta)** | `next-auth` `^5.0.0-beta.32`, `@auth/prisma-adapter` `^2.11.3` | `src/auth.ts`, `src/auth.config.ts` |
| Passwords | **bcryptjs** | `^3.0.3` | `src/auth.ts`, `src/server/services/mfa.ts` |
| MFA — TOTP | **otpauth** + `qrcode` | `otpauth` `^9.5.1`, `qrcode` `^1.5.4` | `src/server/services/mfa.ts` |
| MFA — Passkeys | **@simplewebauthn** (server + browser) | server `^9.0.3`, browser `^9.0.1` | `src/server/services/webauthn.ts` |
| Styling | **Tailwind CSS v4** | `tailwindcss` `^4`, `@tailwindcss/postcss` `^4` | `src/app/globals.css` |
| PWA | **Serwist** (dependency present; see §6 caveat) | `serwist` `^9.5.12`, `@serwist/next` `^9.5.12` | `public/manifest.webmanifest`, `src/app/layout.tsx` |
| Charts | **Recharts** | `^3.10.1` | reports/analytics UI |
| Forms/validation | **react-hook-form** + **Zod** | RHF `^7.85.0`, zod `^4.4.3` | `src/auth.ts` schemas, forms |
| Data fetching (client) | **@tanstack/react-query** | `^5.101.4` | `src/components/providers` |
| UI primitives | **Radix UI**, `lucide-react`, `sonner` (toasts), `class-variance-authority`, `tailwind-merge` | — | `package.json`, `src/components/ui/*` |
| AI copilot | **Groq / OpenAI-compatible** chat completions (provider-agnostic) | plain `fetch`, no SDK | `src/server/ai/saba.ts` |
| Tests | **Vitest** + Testing Library + jsdom | `vitest` `^4.1.11` | `src/server/fsm/*.test.ts` |

Build pipeline (`package.json` scripts): `dev` → `next dev`; **`build` → `prisma generate && next build`**;
`db:seed` → `tsx prisma/seed.ts`; `db:reset` → `prisma db push --force-reset && npm run db:seed`.
`next.config.ts` is intentionally minimal (empty config object).

---

## 2. The FSM engine

Location: `src/server/fsm/engine.ts` (engine), `src/server/fsm/machines/*.ts` (definitions),
`src/server/fsm/xstate.ts` (XState mirror), `src/server/fsm/index.ts` (registry).

### How it works

The FSM is a **tiny declarative engine** — not raw XState at runtime. Each domain entity is
described by a `MachineDef` (`engine.ts:52`), a table of states + role-guarded transitions.
A single `TransitionDef` (`engine.ts:25`) carries:

- `event` — the event name (unique per source state)
- `from` — one or more source states
- `to` — destination state
- `roles?` — roles allowed to fire it; **omitted/empty ⇒ any authenticated user** (`roleAllowed`, `engine.ts:88`)
- `label`, `description`, `intent` (`primary|default|danger|success`) — UI hints the client renders verbatim
- `form?` — a key naming a data form the client must collect first (e.g. `"vitals"`, `"labResults"`, `"diagnosis"`); the backend re-validates
- `guard?` — an optional runtime predicate evaluated against server-provided context

The engine's exported functions (`engine.ts`):

- **`availableTransitions(machine, state, {role, ctx})`** (`engine.ts:94`) — filters transitions by matching source state, then by role, then by guard; returns a serializable **`Affordance[]`** (`engine.ts:57`). This is the affordance list shipped to the client.
- **`canFire(machine, state, event, opts)`** (`engine.ts:120`) — boolean: could this actor fire this event now? (delegates to `availableTransitions`).
- **`resolveTransition(machine, state, event, opts)`** (`engine.ts:133`) — the **validation gate** services call before persisting. Throws a typed `FsmError` with code `INVALID_STATE`, `ILLEGAL_TRANSITION`, or `FORBIDDEN` (`engine.ts:65`) if the state is unknown, no transition matches, the role isn't permitted, or a guard blocks it. Returns `{ to, def }`.

**Single source of truth.** The declarative table is the one authority for *which* transitions
are legal and *who* may fire them. Services never mutate a `state` column without first calling
`resolveTransition` (see `transitionVisit`, `src/server/services/visit.ts:71`). The same table
also drives the UI (§3), so the buttons a user sees and the transitions the server will accept
are guaranteed to agree.

**Mirrored to XState.** `toXStateMachine(def)` (`xstate.ts:14`) compiles a `MachineDef` into a
real XState v5 `createMachine` statechart — final states become `{ type: "final" }`, others get
an `on: { event → target }` map. The declarative table stays the source of truth (it carries
roles/labels/form hints XState doesn't model); the XState mirror exists for **visualization
(Stately)** and **cross-checking in tests** (`src/server/fsm/machines.test.ts`, `fsm.test.ts`),
keeping the two representations in lock-step.

**Registry.** `machines` (`index.ts:26`) keys every machine by its Prisma entity name:
`Visit, LabOrder, DrugOrder, LeaveRequest, Referral, Admission, StockRequest, Appointment, Invoice`.

### Every machine, its states, and who drives it

**1. Visit — the clinical spine** (`machines/visit.ts`; states `VisitState`, `schema.prisma:226`)
States: `REGISTERED → TRIAGE → WAITING_FOR_DOCTOR → IN_CONSULTATION →` {`WAITING_FOR_LAB` ↔ `LAB_RESULTS_READY`, `WAITING_FOR_PHARMACY`, `REFERRED`, `ADMITTED`} `→ COMPLETED`; plus `CANCELLED`. Finals: `COMPLETED`, `CANCELLED`.
Key events/roles: `start_triage` (NURSE/RECEPTIONIST, form `vitals`), `send_to_doctor` (NURSE/RECEPTIONIST, form `assignDoctor`), `begin_consultation` (DOCTOR), `order_labs`/`prescribe`/`refer`/`admit`/`complete` (DOCTOR, each with its own form), `lab_results_ready` (LAB_TECH), `resume_consultation` (DOCTOR — labs route **back** to the doctor rather than closing the visit), `dispensed` (PHARMACIST closes the visit), `discharge` (DOCTOR/NURSE), `cancel` (MANAGER/RECEPTIONIST). Note `complete` is defined twice — once from `IN_CONSULTATION`, once from `REFERRED`.

**2. LabOrder** (`machines/lab-order.ts`; `LabOrderState`, `schema.prisma:339`)
`ORDERED → COLLECTING → IN_PROGRESS → RESULTS_READY → COMPLETED`; plus `DRAFT`, `CANCELLED`. Events: `collect`, `process`, `submit_results` (form `labResults`), `complete`, `cancel` (form `cancelReason`). Almost all LAB_TECH-driven; `complete` also DOCTOR; `cancel` also MANAGER.

**3. DrugOrder** (`machines/drug-order.ts`; `DrugOrderState`, `schema.prisma:486`)
`ORDERED → PARTIALLY_DISPENSED → DISPENSED`; plus `DRAFT`, `CANCELLED`. Events: `record_partial`, `dispense_all` (both PHARMACIST, form `dispense`), `cancel` (PHARMACIST/MANAGER, form `cancelReason`).

**4. Referral** (`machines/referral.ts`; `ReferralState`, `schema.prisma:550`)
`DRAFT → ISSUED → ACKNOWLEDGED → COMPLETED`; plus `CANCELLED`. Events: `issue` (DOCTOR), `acknowledge` (RECEPTIONIST/DOCTOR/MANAGER), `complete` (DOCTOR/RECEPTIONIST), `cancel` (DOCTOR/MANAGER).

**5. Admission** (`machines/admission.ts`; `AdmissionState`, `schema.prisma:607`)
`ADMITTED → ON_WARD → DISCHARGED`; plus `TRANSFERRED`, `CANCELLED`. Events: `settle` (NURSE → ON_WARD), `discharge` (DOCTOR/NURSE, form `discharge`), `cancel` (NURSE/MANAGER).

**6. LeaveRequest** (`machines/leave.ts`; `LeaveState`, `schema.prisma:699`)
`SUBMITTED → APPROVED → ACTIVE → RETURN_REQUESTED → RETURNED`; plus `DRAFT`, `REJECTED`, `CANCELLED`. Events: `approve`/`reject` (MANAGER/HR, form `leaveDecision`), `activate` (MANAGER/HR), `request_return` (any authenticated — the employee), `approve_return` (MANAGER/HR), `cancel` (any). When a request reaches `ACTIVE` the employee's `employmentStatus` flips to `ON_LEAVE`, which **blocks their login** (see §5).

**7. StockRequest** (`machines/stock-request.ts`; `StockRequestState`, `schema.prisma:773`)
`SUBMITTED → APPROVED → FULFILLED`; plus `REJECTED`. Events: `approve`/`reject` (STORE_KEEPER/MANAGER), `fulfill` (STORE_KEEPER).

**8. Appointment** (`machines/appointment.ts`; `AppointmentState`, `schema.prisma:941`)
`SCHEDULED → CONFIRMED → CHECKED_IN → COMPLETED`; plus `CANCELLED`, `NO_SHOW`. Events: `confirm`/`check_in`/`no_show`/`cancel` (RECEPTIONIST/NURSE, cancel also MANAGER), `complete` (DOCTOR/RECEPTIONIST).

**9. Invoice** (`machines/invoice.ts`; `InvoiceState`, `schema.prisma:975`)
`DRAFT → ISSUED → PARTIALLY_PAID → PAID`; plus `VOID`. Events: `issue` (RECEPTIONIST/MANAGER), `record_partial`, `settle` (RECEPTIONIST/MANAGER), `void` (MANAGER only).

### How `canFire`/affordances are computed

For a given `(machine, currentState, actorRole, ctx)` the engine keeps only transitions whose
`from` matches the state, whose `roles` include the actor (or is empty), and whose `guard`
passes — then projects each survivor to a serializable `Affordance` (event, to, label,
description, intent, form). `canFire` is just "does the affordance list contain this event?"
This means the *same* computation answers both "what buttons do I render?" and "may this action
proceed?".

### Transition execution & audit

Every state change flows through a service (e.g. `transitionVisit`, `src/server/services/visit.ts:71`):
(1) load the entity, (2) `resolveTransition(...)` FSM gate (throws on illegal/unauthorized),
(3) apply event side-effects **inside a `db.$transaction`** (create the lab/drug order, mark a
bed OCCUPIED, set `closedAt`, etc.), (4) update the `state` column, (5) `logTransition(...)`
into the central `StateTransition` table, (6) `notifyRole(...)` the next team, (7)
`revalidatePath(...)`. The `StateTransition` model (`schema.prisma:873`) is a generic
platform-wide event log keyed by `entityType`/`entityId`.

---

## 3. Backend-driven UI (HATEOAS-style affordances)

This is a **core architectural idea**: the server decides what the client may do, and the client
renders exactly that — nothing more, nothing less.

**Flow (verified in code):**

1. A Server Component page loads the entity and computes affordances for the current actor.
   Example: `src/app/(app)/visits/[id]/page.tsx:64` calls
   `const affordances = visitAffordances(visit.state, actor)`, where
   `visitAffordances` (`src/server/services/visit.ts:59`) is a thin wrapper over
   `availableTransitions(visitMachine, state, { role: actor.role })`.
2. The page passes that `Affordance[]` into a client component:
   `<VisitActions visitId=… affordances={affordances} catalog=… />`
   (`visits/[id]/page.tsx:235`).
3. The client (`visits/[id]/visit-actions.tsx`) renders **one button per affordance**, styling it
   from `affordance.intent` (`intentVariant`, `visit-actions.tsx:34` maps `primary/success/danger`
   → button variants) and labelling it from `affordance.label`. If the affordance carries a
   `form` key, clicking opens the matching dialog to collect that data before firing.
4. Firing calls a Server Action (`advanceVisit`) which re-enters the service → `resolveTransition`
   re-validates the *same* rule server-side. The client is therefore never trusted; the affordance
   list is a convenience projection of an authority that is re-checked on write.

The same pattern is used across the app — affordance-driven action components exist for
appointments, wards/admissions, referrals, lab orders, HR leave, billing, and store requests
(files: `appointments/[id]/appointment-actions.tsx`, `wards/[id]/admission-actions.tsx`,
`referrals/[id]/referral-actions.tsx`, `lab/[id]/lab-order-client.tsx`,
`hr/leave/leave-actions.tsx`, `billing/[id]/billing-actions.tsx`,
`store/requests/requests-client.tsx`).

**Why it matters:** roles, legal transitions, button labels, styling intent, and required forms
are all declared *once* in the FSM table. Adding/gating an action is a one-line change to a
machine definition; the UI updates automatically and the server enforcement can't drift from what
the UI offers. This is the "backend decides what the frontend shows" (HATEOAS-style) contract
called out in `engine.ts:8-16`.

---

## 4. Feature-flag system

Registry: `src/lib/features.ts`. Runtime resolver + DB mirror: `src/server/services/settings.ts`.
DB model: `FeatureFlag` (`schema.prisma:916`).

**Fowler-style categories** — enum `FeatureCategory` (`schema.prisma:908`):

- `RELEASE` — ship in-progress work dark
- `OPS` — operational kill-switches
- `PERMISSION` — entitle by role / plan
- `EXPERIMENT` — A/B or pilot
- `TENANT` — per-institution capability (white-label)

**Registry is the source of truth.** `FEATURES: FeatureDef[]` (`features.ts:19`) lists every flag
with `key`, `name`, `description`, `category`, `defaultEnabled`, and a `group`. Helpers:
`FEATURE_KEYS`, `FEATURE_MAP`.

**DB rows mirror it for runtime toggling.** `FeatureFlag` rows let a manager flip flags at runtime;
`rolloutRoles: Role[]` supports PERMISSION-style role gating (empty = everyone).
`settings.ts` provides:
- `isFeatureEnabled(key, role?)` (`settings.ts:24`) — DB row wins, else registry default; honors `rolloutRoles` (MANAGER always passes).
- `enabledFeatureSet(role?)` (`settings.ts:36`) — the set of enabled keys for a role, used to filter nav/UI.
- `listFlags()` (`settings.ts:52`) — merged registry+DB view for the admin toggle screen (`/settings/features`), with an `overridden` marker.
- `setFeatureFlag(key, patch, actorId)` (`settings.ts:69`) — upsert + `revalidatePath("/", "layout")`.
- `syncFeatureRegistry()` (`settings.ts:90`) — idempotently upsert all registry flags into the DB.

**Gating.** Nav items carry an optional `feature` key (`src/lib/nav.ts`), so disabled modules drop
out of the sidebar; server actions and UI branches call `isFeatureEnabled(...)` (e.g. the Saba API
route checks `isFeatureEnabled("ai.assistant")`, `src/app/api/saba/route.ts`).

**Flag GROUPS** (the `group` field, verified in `features.ts`):

- **Modules** (all `TENANT`): `module.reception`, `module.triage`, `module.doctor`, `module.lab`, `module.pharmacy`, `module.wards`, `module.referrals`, `module.hr`, `module.store`, `module.reports`, `module.portal`, `module.billing`, `module.appointments`.
- **Clinical**: `clinical.sims_lookup` (TENANT), `clinical.allergies`, `clinical.problem_list`, `clinical.vitals_trends`, `clinical.immunization`, `clinical.icd10` (RELEASE, on), `clinical.consent` (RELEASE, **off**).
- **Documents** (all `TENANT`): `docs.sick_leave`, `docs.prescription_print`, `docs.referral_print`, `docs.lab_report_print`.
- **HR & Store**: `hr.attendance` (on), `hr.payroll` (**off**), `hr.leave_balances` (on), `store.purchase_orders`, `store.stock_counts` (all RELEASE).
- **Platform**: `ux.command_palette`, `ux.dark_mode` (RELEASE), `ux.notifications`, `platform.audit_log` (OPS), `platform.two_factor` (PERMISSION, **off** by default), `ai.assistant` (RELEASE, **off** — Saba), `platform.white_label` (TENANT).

---

## 5. Security

### RBAC

- **Roles** — enum `Role` (`schema.prisma:22`): `MANAGER, DOCTOR, LAB_TECH, PHARMACIST, RECEPTIONIST, NURSE, HR, STORE_KEEPER`. Labels in `src/lib/rbac.ts:3`.
- **Session guards** — `src/server/session.ts` (all `"server-only"`): `getActor()` (nullable), `requireStaff()` (redirects to `/login` if not staff), `requireStudent()` (redirects to `/student-login`), and `requireRole(...roles)` (`session.ts:46`) which **always lets MANAGER through**, else redirects non-matching roles to `/dashboard`. The `Actor` shape is `{id, name, email?, kind: "staff"|"student", role}`.
- **Section access** — `SECTION_ACCESS` (`rbac.ts:33`) maps each top-level section to the roles allowed (or `null` = any authenticated staffer). `canAccess(section, role)` (`rbac.ts:57`) drives the sidebar and section guards. Examples: `lab → [LAB_TECH, MANAGER]`, `hr → [HR, MANAGER]`, `settings → [MANAGER]`, `reports → [MANAGER]`.
- **Middleware route protection** — `src/middleware.ts` runs the edge-safe Auth.js config. Public paths: `/`, `/login`, `/student-login`, and `/verify[/…]`. Unauthenticated users are redirected to the correct login (portal → `/student-login`, else `/login`) preserving `callbackUrl`. **Students are confined to `/portal`**; staff hitting `/portal` are bounced to `/dashboard`. The matcher excludes `api`, Next internals, and static assets.

### Auth.js credential providers

Two `Credentials` providers in `src/auth.ts`:

- **`staff`** — email + password. Looks up the user (lower-cased email), rejects inactive accounts, `bcrypt.compare` the password. **Blocks any non-`ACTIVE` `employmentStatus`** by throwing `BlockedSignin` (surfaces as `?error=blocked`). If `mfaEnabled`, requires a valid second factor or throws `MfaRequiredSignin`/`MfaInvalidSignin`.
- **`student`** — `studentId` + password against `Patient.portalPasswordHash`, gated on `portalEnabled`. Students get `role: null`, `kind: "student"`.

Session strategy is **JWT** (`src/auth.config.ts`); the JWT/session callbacks stamp `uid`, `kind`,
and `role` onto the token/session. The credential providers (which touch Prisma/Node) live only in
`auth.ts`; `auth.config.ts` is the **edge-safe split** shared with middleware (no Prisma/Node APIs)
— see §6.

### MFA — TOTP, passkeys, recovery codes (`src/server/services/mfa.ts`, `webauthn.ts`)

- **TOTP** via `otpauth`: `generateTotpSecret()` (base32, 20 bytes), `totpKeyUri()` + `totpQrDataUrl()` (QR for enrolment), `verifyTotp(secret, token)` — SHA1/6-digit/30s, tolerant of spaces/hyphens, ±1 step drift (`window: 1`). Secret stored in `User.totpSecret`, enrolment state in `User.mfaEnabled`/`mfaEnrolledAt` (`schema.prisma:46`).
- **Passkeys (WebAuthn)** via `@simplewebauthn/server` v9 (`webauthn.ts`): registration + authentication option builders and verifiers. `rpID`/`origin` are **derived from the incoming request headers** (`getRp()`) so it works on any host/port in dev and the campus domain in prod. Credentials persist in the `Authenticator` model (`schema.prisma:126`): base64url `credentialId`/`publicKey`, a BigInt signature `counter`, transports, deviceType, backedUp, label.
- **Single-use recovery codes**: `generateRecoveryCodes(count=10)` returns plaintext (shown once) + bcrypt hashes (stored). Format `xxxx-xxxx-xxxx`. Stored in `RecoveryCode` (`schema.prisma:114`) and **consumed on use** — the login flow's `passesSecondFactor` (`auth.ts`) tries TOTP first, then iterates unused recovery codes with `bcrypt.compare` and stamps `usedAt` on a match.

### On-leave login lockout

When a `LeaveRequest` reaches `ACTIVE`, the employee's `employmentStatus` becomes `ON_LEAVE`
(`schema.prisma:33`, machine note in `machines/leave.ts`). The staff `authorize` in `auth.ts`
rejects any non-`ACTIVE` status via `BlockedSignin`, so on-leave/suspended/terminated staff cannot
sign in.

### HMAC document signing + public `/verify` (`src/server/services/document-signing.ts`)

Tamper-evident issued documents and referrals. Each carries a short **public `verifyCode`**
(printed as text + QR) and an **HMAC-SHA256 `signature`** over the record's *immutable* facts.
- Signing key: `DOCUMENT_SIGNING_SECRET` → else `AUTH_SECRET` → else a dev fallback (`secret()`).
- `verifyCode` uses a Crockford base32 alphabet with ambiguous chars removed (`newVerifyCode`), displayed grouped `ABCDE-FGHIJ`.
- `computeSignature(doc)` HMACs a deterministic `canonical(...)` string (docNo, type, patient/visit ids, dates, days, issuer, issuedAt). Documents are signed on creation (`signIssuedDocument`); **referrals are signed lazily on first print** (`ensureReferralSignature`).
- **Public verification**: `verifyByCode(rawCode)` (used by `/verify/[code]`, a public route) looks up the document *or* referral, recomputes the HMAC, and returns `valid | invalid | revoked | not_found`, using `timingSafeEqual` for the comparison. A photoshopped certificate won't verify; a genuine one always will. Revocation via `IssuedDocument.revokedAt` (or a `CANCELLED` referral).

### Audit log (`src/server/services/events.ts`)

`audit(actorId, action, entityType?, entityId?, meta?)` writes to `AuditLog` (`schema.prisma:889`).
It is **best-effort**: a logging failure must never break the primary operation, and if the
`actorId` FK can't be resolved (e.g. a session that predates a DB reseed) it retries as a system
(`actorId: null`) entry. Separately, `logTransition(...)` writes the FSM `StateTransition` trail,
and `notifyRole`/`notifyUser` fan `Notification` rows to a role or an individual.

### Saba AI authorization model (`src/server/ai/saba.ts`, `src/app/api/saba/route.ts`)

Saba is deliberately constrained:

- **Read-only.** The `READ_ONLY` system-prompt clause forbids any action; Saba can only look up/explain and links the user to the page where the app shows a real button. Persona prompts also add a `SCOPE_GUARD` (clinic-only) and safety framing (`SAFETY_DOCTOR` = decision support, not a decision maker; `SAFETY_STUDENT` = friendly guide, not a doctor).
- **Own-record only for students.** The API route requires `actor.kind === "student"` for student scope and builds context from `actor.id` only (`buildStudentContext`); the `AUTHZ_STUDENT` clause refuses any other person's data.
- **Clinical-role + real-visit only for patient context.** Deep clinical patient context (`buildDoctorContext`) is attached **only** when the actor's role is in `["DOCTOR","NURSE","MANAGER"]` **and** a `visitId` resolves to a real visit the user opened — never a client-supplied `patientId`. The route re-derives `patientId` from the visit server-side. `AUTHZ_STAFF` restricts Saba to the provided role data + current patient only.
- **Feature- and config-gated.** The route 401s without a session, 403s unless `ai.assistant` is enabled, and 503s if no AI provider is configured. Responses stream as plain-text chunks.

---

## 6. Deployment / cloud-native

**Serverless on Vercel.** The app is a Next.js App Router deployment that runs as serverless
functions. Auth is deliberately **split for the edge**: `src/auth.config.ts` is an edge-safe
config (no Prisma/Node APIs, empty `providers`) used by `src/middleware.ts`, while the full
`src/auth.ts` (credential providers, bcrypt, Prisma) runs on the **Node runtime**. This lets the
middleware do cheap JWT-based route protection at the edge without dragging Prisma into the edge
bundle. Routes needing Node explicitly opt in — e.g. `src/app/api/saba/route.ts` sets
`export const runtime = "nodejs"` and `dynamic = "force-dynamic"`.

**Neon serverless Postgres.** `datasource db` uses `provider = "postgresql"` with
`url = env("DATABASE_URL")` (`prisma/schema.prisma:12`). In production this points at Neon; the
connection string should use Neon's **pooled (PgBouncer)** endpoint so many short-lived serverless
invocations share a bounded pool. `src/server/db.ts` keeps a single `PrismaClient` and caches it on
`globalThis` outside production to survive dev hot-reloads. (Note: `.env.example` ships a local
Docker Postgres URL for dev; the Neon/pooled URL is a deploy-time env value, and no `directUrl`
is declared in the schema on this branch.)

**Env-based config.** All environment-specific behavior is env-driven: `DATABASE_URL`,
`AUTH_SECRET`, `AUTH_TRUST_HOST` (Auth.js derives the URL from the request so login redirects
follow whatever port/host you run on — `AUTH_URL` is set only for a fixed prod deploy),
`DOCUMENT_SIGNING_SECRET`, the `SIMS_*` student-lookup integration, and the `SABA_*` AI provider
knobs (`SABA_PROVIDER|BASE_URL|API_KEY|MODEL`). See `.env.example`.

**PWA / offline.** The app is installable: `public/manifest.webmanifest` (standalone display,
themed, maskable icons) is wired via `metadata.manifest` and `appleWebApp` in
`src/app/layout.tsx`. **Honest caveat:** `serwist`/`@serwist/next` are listed as dependencies, but
on this branch there is **no `sw.ts` service worker and no Serwist wiring in `next.config.ts`** —
so today the PWA is manifest-based (installable, themed) rather than a fully offline-caching
service worker. That's the intended direction (Serwist is already a dependency) but not yet active.

**Build.** `npm run build` = `prisma generate && next build`, so the Prisma client is regenerated
against the schema on every deploy.

**Architecture, honestly stated: a modular monolith with clear service boundaries.**
This is a single Next.js application, **not** literal separate microservices. Its modularity comes
from a disciplined **service layer**: `src/server/services/*` are the domain "services" — one file
per bounded context (`visit`, `lab`, `pharmacy`, `ward`, `referral`, `billing`, `hr`, `hr-ops`,
`inventory`, `store`, `appointment`, `clinical`, `patient`, `documents`, `document-signing`,
`notifications`, `events`, `mfa`, `webauthn`, `settings`, `ids`, `qr`), plus `src/server/fsm/*`
(state authority), `src/server/ai/*` (Saba), and `src/server/integrations/*` (e.g. the SIMS
student-information adapter). UI (`src/app/**`) and API routes call **into** these services; the
services own all writes and all FSM gating. Because each service is a clean module with an explicit
interface and its own FSM machine, a context (say pharmacy or lab) could be peeled off into its own
deployable unit later with limited blast radius — the boundaries are already drawn. Deployed
cloud-native serverless on Vercel + Neon, it is best described as a **modular, service-layered
monolith that is decomposable**, not a set of running microservices.

---

## 7. Data model

Full schema: `prisma/schema.prisma` (1,185 lines). Key entities and relationships:

**Identity & RBAC**
- **User** (`:46`) — staff account: `role`, `employmentStatus` (`ACTIVE|ON_LEAVE|SUSPENDED|TERMINATED`), profile, `departmentId`, security fields (`mfaEnabled`, `totpSecret`, `mfaEnrolledAt`, `username`), `isActive`. Hub of ~30 relations (visits as doctor/creator, orders, referrals, admissions, leave, attendance, shifts, notifications, transitions, audit logs, etc.).
- **RecoveryCode** (`:114`) — hashed single-use MFA codes; `usedAt`. Cascade-deletes with the user.
- **Authenticator** (`:126`) — a WebAuthn passkey (credentialId/publicKey/counter/transports/deviceType/backedUp/label).
- **Department** (`:143`) — clinical/academic/admin unit; has `staff` and `patients`.

**Patients**
- **Patient** (`:171`) — `mrn` (clinic MRN), `type` (`STUDENT|STAFF|DEPENDENT|EXTERNAL`), `source` (`MANUAL|SIMS`), `studentId` (unique, portal login), demographics, student/SIMS fields (college, program, year, block, dorm, emergency contacts), and self-service portal access (`portalPasswordHash`, `portalEnabled`). Owns visits, admissions, referrals, issued documents, appointments, invoices, allergies, problems, immunizations.

**Clinical spine**
- **Visit** (`:246`) — the encounter the FSM drives. `visitNo`, `state` (`VisitState`), `priority`, `patient`, optional `doctor`, `createdBy`, clinical fields (`chiefComplaint`, `symptoms`, `diagnosis`, `disease`, `icdCode`), `openedAt`/`closedAt`. Has vitals, clinical notes, lab orders, drug orders, referrals, one admission, issued documents, invoices.
- **Vitals** (`:287`) — per-visit measurements (temp, pulse, BP, resp, SpO2, weight, height), `takenBy`.
- **ClinicalNote** (`:307`) — `PROGRESS|ASSESSMENT|PLAN` note bodies.

**Laboratory**
- **LabTest** (`:323`) — catalog test (name/category/price).
- **LabOrder** (`:365`) — `orderNo`, `state` (`LabOrderState`), belongs to a Visit; has **LabOrderItem**s.
- **LabOrderItem** (`:386`) — one ordered test with `state` (`LabItemState`), `resultValue`, `resultFlag` (`NORMAL|LOW|HIGH|CRITICAL`), resulter.

**Pharmacy**
- **Supplier** (`:410`), **Medication** (`:422`, drug master with `reorderLevel`; unique on name+strength+form), **MedicationBatch** (`:440`, real lot/expiry/qty/cost/sell price stock), **StockMovement** (`:469`, `RECEIVE|DISPENSE|ADJUST_UP|ADJUST_DOWN|EXPIRE|RETURN`).
- **DrugOrder** (`:502`) — `state` (`DrugOrderState`), belongs to a Visit; has **DrugOrderItem** (`:522`, medication + dose/frequency/duration/quantity, `dispensedQty`, dispenser, `DrugItemState`).

**Referrals** — **Referral** (`:564`): external-facility referral tied to patient (+ optional visit), `state`/`urgency`, `toFacility`, clinical summary, and tamper-evident `verifyCode`/`signature`.

**Wards / admissions** — **Ward** (`:615`, gendered, capacity) → **Bed** (`:626`, `BedStatus AVAILABLE|OCCUPIED|MAINTENANCE`, unique per ward+label) → **Admission** (`:638`, `admNo`, `AdmissionState`, optional 1:1 visit, ward/bed, admitter, discharge notes).

**HR** — **Education** (`:668`), **WorkExperience** (`:679`), **LeaveRequest** (`:710`, `LeaveType` × `LeaveState`, employee + approver, dates, decision) — the driver of the ON_LEAVE login lock. Plus **Attendance** (`:1058`, unique per user+date, clock-in/out, `AttendanceStatus`), **Shift** (`:1073`), **LeaveBalance** (`:1087`, entitled/used per type+year).

**Store / assets** — **Asset** (`:738`, tagged inventory) → **AssetAssignment** (`:759`, `ASSIGNED|RETURNED|LOST|DAMAGED`); **StockRequest** (`:780`, general supply request FSM). Procurement: **PurchaseOrder** (`:1111`, `PurchaseOrderState`) → **PurchaseOrderItem** (`:1127`).

**Billing** — **Invoice** (`:1000`, `InvoiceState`, `total`/`paid`, patient + optional visit) → **InvoiceItem** (`:1021`, `ChargeCategory CONSULTATION|LAB|PHARMACY|PROCEDURE|WARD|OTHER`) and **Payment** (`:1034`, `PaymentMethod CASH|CARD|MOBILE|WAIVER|INSURANCE`).

**Documents & cross-cutting**
- **IssuedDocument** (`:807`) — `docNo`, `DocumentType` (`SICK_LEAVE|PRESCRIPTION|REFERRAL|LAB_REPORT|ADMISSION_SUMMARY|VISIT_SUMMARY`), optional visit/patient/issuer, sick-leave fields, printed `payload` snapshot, `verifyCode`/`signature`/`revokedAt`.
- **Notification** (`:854`) — `NotificationType`, targets a specific `recipientId` and/or a whole `recipientRole` (broadcast), `readAt`.
- **StateTransition** (`:873`) — generic FSM audit log (`entityType`, `entityId`, `event`, `fromState`, `toState`, actor, meta).
- **AuditLog** (`:889`) — general activity trail (actor, action, entityType/Id, ip, meta).

**Platform config**
- **FeatureFlag** (`:916`) — DB mirror of the feature registry (`key`, `category`, `enabled`, `rolloutRoles`).
- **Setting** (`:930`) — generic key→JSON store (used for `branding`).

**Appointments** — **Appointment** (`:950`, `apptNo`, `AppointmentState`, patient + provider, `scheduledFor`, duration).

**Clinical compliance** — **Allergy** (`:1153`, `AllergySeverity`), **ProblemListItem** (`:1164`, `ProblemStatus ACTIVE|RESOLVED`, icdCode), **Immunization** (`:1176`, vaccine/dose/nextDue).

---

## 8. Modules

App routes live under `src/app/(app)/**` (staff shell), `src/app/portal/**` (student portal),
`src/app/print/**` (printables), plus `/login`, `/student-login`, `/verify/[code]`. Nav grouping is
in `src/lib/nav.ts`; access rules in `SECTION_ACCESS` (`src/lib/rbac.ts`). Each module is backed by
a service in `src/server/services/*`.

**Clinical group**
- **Dashboard** (`/dashboard`) — role-aware landing; everyone lands on the same shell and sees content for their role.
- **Reception** (`/reception`) — front-desk registration and visit intake (creates `REGISTERED` visits). Roles: RECEPTIONIST, MANAGER.
- **Patients** (`/patients`, `/patients/[id]`, `/…/vitals`) — patient records, history, allergies/problems/immunizations, vitals trends. Roles: RECEPTIONIST, NURSE, DOCTOR, MANAGER.
- **Appointments** (`/appointments`, `/new`, `/[id]`) — scheduling/calendar; appointment FSM (confirm/check-in/complete/no-show/cancel).
- **Triage** (`/triage`) — nurse vitals capture and triage queue; fires `start_triage`/`send_to_doctor`. Roles: NURSE, MANAGER.
- **Consultations / Doctor** (`/doctor`, `/doctor/caseload`, `/visits/[id]`) — the doctor workspace: begin consultation, order labs, prescribe, refer, admit, complete; where Saba's clinical copilot attaches to the open visit. Roles: DOCTOR, MANAGER.
- **Laboratory** (`/lab`, `/lab/[id]`, `/lab/catalog`) — lab worklist, order processing, result entry; lab-order FSM. Roles: LAB_TECH, MANAGER.
- **Pharmacy** (`/pharmacy`, `/pharmacy/[id]`, `/inventory`, `/inventory/new`, `/suppliers`) — dispensing queue, batch/expiry inventory, suppliers; drug-order FSM. Roles: PHARMACIST, MANAGER.
- **Wards** (`/wards`, `/wards/[id]`) — inpatient beds and admissions; admission FSM (settle/discharge/cancel). Roles: NURSE, DOCTOR, MANAGER.
- **Referrals** (`/referrals`, `/new`, `/[id]`) — external-hospital referrals; referral FSM + signed printable letter. Roles: DOCTOR, RECEPTIONIST, MANAGER.
- **Queue board** (`/queue`) — live waiting-room/queue display; open to any authenticated staffer.

**Operations group**
- **Billing** (`/billing`, `/billing/[id]`) — charges, invoices, payments; invoice FSM + printable receipt. Roles: RECEPTIONIST, MANAGER.
- **Human Resources** (`/hr`, `/hr/leave`, `/hr/attendance`, `/hr/leave-balances`, `/hr/roster`) — leave requests/approvals (drives the ON_LEAVE lock), attendance, leave balances, rosters/shifts. Roles: HR, MANAGER.
- **Store & Assets** (`/store`, `/store/assets`, `/store/requests`, `/store/purchase-orders`) — non-medical inventory/assets, stock requests (FSM), purchase orders. Roles: STORE_KEEPER, MANAGER.
- **Staff Directory** (`/staff`, `/staff/[id]`) — staff profiles/records. Roles: MANAGER, HR.

**Management group**
- **Reports** (`/reports`) — management dashboards/analytics (Recharts). Roles: MANAGER.
- **Settings** (`/settings` + `/appearance`, `/audit`, `/features`, `/organization`, `/security`) — white-label branding, feature-flag toggles, audit-log viewer, organization config, security/MFA. Roles: MANAGER.

**Student portal** (`/portal`, students confined here by middleware)
- `/portal` (home), `/portal/appointments`, `/portal/documents` (+`/[id]`), `/portal/health` (Saba student guide), `/portal/history` (+`/[id]` visit detail). Students self-serve their own record only.

**Cross-cutting routes**
- **Documents** (`/documents`, `/documents/issue[/visitId]`, `/documents/[id]`) — issue/manage signed clinical documents.
- **Print** (`/print/{discharge,lab,prescription,receipt,referral,sick-leave,visit-summary}/[id]`) — server-rendered printables that trigger HMAC signing.
- **Verify** (`/verify`, `/verify/[code]`) — **public** document/referral authenticity check (no login).
- **Notifications** (`/notifications`), **Profile** (`/profile`, self-service MFA/passkey/recovery-code management).
- **API**: `/api/auth/[...nextauth]` (Auth.js handlers), `/api/saba` (streaming AI, Node runtime).
- **Integrations**: `src/server/integrations/sims/*` — university SIMS student-lookup adapter (gated by `clinical.sims_lookup`; `SIMS_PROVIDER=mock` in dev).

---

*Compiled from source on branch `feature/platform-v2`. All file:line citations reference the
working tree at the time of writing.*
