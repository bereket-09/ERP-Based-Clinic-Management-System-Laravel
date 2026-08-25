# DDU Clinic Platform — Feature & Architecture Notes

> Source-of-truth notes for the product/architecture PDF and pitch deck. Every claim below is verified against code; file paths are cited inline. Nothing here is aspirational unless explicitly marked **(Future)**.

The platform is a from-scratch Next.js (App Router) + TypeScript rebuild of an ERP-style clinic management system for the **Dire Dawa University (DDU) Student Clinic Center**. Server logic lives under `src/server/*` (services, FSM engine, integrations, AI); the UI is React Server/Client Components under `src/app/*` and `src/components/*`. Business state is governed by a small hand-rolled finite-state-machine (FSM) engine (`src/server/fsm/*`), which enforces both *legal transitions* and *role authorization* in one place.

---

## 1. Full Feature Inventory (feature flags)

**Canonical registry:** `src/lib/features.ts` — a Fowler-style toggle registry (`FEATURES: FeatureDef[]`). Each entry has `key`, `name`, `description`, `category` (`TENANT | RELEASE | OPS | PERMISSION`), `defaultEnabled`, and `group`. The DB `FeatureFlag` rows mirror this registry so a manager can flip toggles at runtime; UI, navigation, and server actions gate on `isFeatureEnabled(key)` (`src/server/services/settings.ts:22`). Nav items are filtered by feature in `src/components/shell/app-shell.tsx` (`!i.feature || featureSet.has(i.feature)`).

Categories carry intent: **TENANT** = tenant capability / white-label module; **RELEASE** = release toggle for a shipping feature; **OPS** = operational toggle; **PERMISSION** = security/permission-gated.

### Group: Modules (tenant capabilities / white-label) — all `TENANT`
| Key | Name | Description | Default |
|---|---|---|---|
| `module.reception` | Reception & registration | Front-desk registration and visit intake. | ✅ on |
| `module.triage` | Nurse triage | Vitals capture and triage queue. | ✅ on |
| `module.doctor` | Consultations | Doctor consultation workspace. | ✅ on |
| `module.lab` | Laboratory | Lab orders, worklist and results. | ✅ on |
| `module.pharmacy` | Pharmacy | Dispensing and medicine inventory. | ✅ on |
| `module.wards` | Wards & admissions | Inpatient beds and admissions. | ✅ on |
| `module.referrals` | Referrals | External hospital referrals. | ✅ on |
| `module.hr` | Human resources | Staff, leave, attendance & payroll. | ✅ on |
| `module.store` | Store & assets | Non-medical inventory and assets. | ✅ on |
| `module.reports` | Reports & analytics | Management dashboards. | ✅ on |
| `module.portal` | Student portal | Student self-service portal. | ✅ on |
| `module.billing` | Billing & cashier | Charges, invoices and payments. | ✅ on |
| `module.appointments` | Appointments | Scheduling and calendar. | ✅ on |

### Group: Clinical
| Key | Name | Description | Category | Default |
|---|---|---|---|---|
| `clinical.sims_lookup` | SIMS student lookup | Fetch student details from the university SIMS. | TENANT | ✅ on |
| `clinical.allergies` | Allergy list | Record and warn on patient allergies. | RELEASE | ✅ on |
| `clinical.problem_list` | Problem list | Longitudinal problem/condition list. | RELEASE | ✅ on |
| `clinical.vitals_trends` | Vitals trends | Charted vitals over time. | RELEASE | ✅ on |
| `clinical.immunization` | Immunizations | Vaccination records. | RELEASE | ✅ on |
| `clinical.icd10` | ICD-10 coding | Structured diagnosis coding. | RELEASE | ✅ on |
| `clinical.consent` | Consent capture | Record patient consent for procedures. | RELEASE | ❌ off |

### Group: Documents — all `TENANT`
| Key | Name | Description | Default |
|---|---|---|---|
| `docs.sick_leave` | Sick-leave certificates | Printable sick-leave documents. | ✅ on |
| `docs.prescription_print` | Prescription printout | Printable prescriptions. | ✅ on |
| `docs.referral_print` | Referral letter | Printable referral letters. | ✅ on |
| `docs.lab_report_print` | Lab report printout | Printable lab reports. | ✅ on |

### Group: HR & Store
| Key | Name | Description | Category | Default |
|---|---|---|---|---|
| `hr.attendance` | Attendance & shifts | Clock-in/out and rosters. | RELEASE | ✅ on |
| `hr.payroll` | Payroll | Salary and payslips. | RELEASE | ❌ off |
| `hr.leave_balances` | Leave balances | Per-employee leave entitlements. | RELEASE | ✅ on |
| `store.purchase_orders` | Purchase orders | Procurement and goods-receipt. | RELEASE | ✅ on |
| `store.stock_counts` | Stock counts | Physical inventory counts. | RELEASE | ✅ on |

### Group: Platform / UX
| Key | Name | Description | Category | Default |
|---|---|---|---|---|
| `ux.command_palette` | Command palette | Global ⌘K quick navigation & search. | RELEASE | ✅ on |
| `ux.dark_mode` | Dark mode | Theme switcher. | RELEASE | ✅ on |
| `ux.notifications` | Notifications centre | In-app notifications. | OPS | ✅ on |
| `platform.audit_log` | Audit log | Full activity audit trail. | OPS | ✅ on |
| `platform.two_factor` | Two-factor auth | Optional 2FA for staff. | PERMISSION | ❌ off |
| `ai.assistant` | Saba AI assistant | AI clinical copilot for doctors + caring health guide for students. Requires an AI provider key (Groq / OpenAI / Ollama). | RELEASE | ❌ off |
| `platform.white_label` | White-label branding | Custom colours, name and logo. | TENANT | ✅ on |

**Defaults-off (notable):** `clinical.consent`, `hr.payroll`, `platform.two_factor`, `ai.assistant`. Everything else defaults on.

---

## 2. Saba — the AI Assistant

**Files:** `src/server/ai/saba.ts` (engine, personas, context builders), `src/app/api/saba/route.ts` (streaming HTTP endpoint + authorization), `src/components/saba/saba-chat.tsx` (chat UI + CTA rendering), `src/components/saba/saba-widget.tsx` (floating launcher). Gated by the `ai.assistant` feature flag.

### 2.1 Provider-agnostic engine
Saba talks to **any OpenAI-compatible `/chat/completions` endpoint**, so it runs on Groq, OpenAI, Ollama, or a self-hosted gateway with no code change — purely env-configured (`src/server/ai/saba.ts:16-42`):
- `SABA_PROVIDER` = `groq | openai | ollama | custom` (selects defaults; default is `groq`).
- `SABA_BASE_URL`, `SABA_API_KEY`, `SABA_MODEL` override.
- Per-provider defaults: **groq → `https://api.groq.com/openai/v1`, model `openai/gpt-oss-120b`** (the demo config); openai → `https://api.openai.com/v1`, `gpt-4o-mini`; ollama → `http://localhost:11434/v1`, `llama3.1`.
- `configured` is true only when a base URL + model exist and (for hosted providers) an API key is present. Ollama needs no key.
- **Streaming:** `streamSaba()` is an async generator that POSTs `{model, messages, temperature: 0.3, stream: true}` and parses the SSE `data:` lines, yielding `delta.content` text chunks (`saba.ts:50-91`). The route pipes these into a `ReadableStream` back to the browser; `saba-chat.tsx` reads the stream and appends tokens live.

### 2.2 Two faces
Saba presents as **one assistant with two personas**, chosen by `scope` on the request:

**A. Doctor / staff copilot** (`scope: "staff"`, floating widget mounted app-wide in `app-shell.tsx` when `ai.assistant` is on). System prompt built by `staffSystemPrompt(role, roleContext, patientContext)` (`saba.ts:125`). It is **history-aware** (last 12 user/assistant turns, `route.ts:42`) and **role-aware**, with live read-only tooling per role (see 2.4). For a doctor with a real on-screen visit it becomes a clinical copilot: history-aware differentials, "tests to consider", red-flag flagging — framed as decision support (`SAFETY_DOCTOR`).

**B. Student health guide** (`scope: "student"`, student portal). System prompt `studentSystemPrompt(context)` (`saba.ts:148`) — "a caring health guide … like a kind older sister." Uses the student's own past visits only, to give gentle self-care advice and nudge them to visit the clinic / seek emergency care when appropriate (`SAFETY_STUDENT`).

The floating widget (`saba-widget.tsx`) is a contact-us-style bubble ("Ask Saba") that expands to a popup or full-screen. For staff it **auto-detects the patient** from the current `/visits/[id]` route (`pathname.match(/\/visits\/([^/?#]+)/)`) so answers stay in the consultation's context — the client never hand-picks an arbitrary patient id.

### 2.3 Guardrails (the safety spine)
All persona strings live at `saba.ts:95-111`. Four layers:

1. **READ-ONLY** (`READ_ONLY`, `saba.ts:104`) — *"You are READ-ONLY. You can look things up and explain, but you CANNOT make any change, approve, order, dispense, book or edit anything. Never claim you did an action."* When the user needs to *do* something, Saba emits a markdown link to the exact page (e.g. `[Open the leave queue](/hr/leave)`), which the chat UI renders as a pill-shaped **CTA button** (`renderRich()` in `saba-chat.tsx:10-41` turns `[label](/path)` into a `next/link` and `**bold**` into `<strong>`). Saba has *no tools that mutate* — it only reads context the server pre-builds.

2. **SCOPE GUARD** (`SCOPE_GUARD`, `saba.ts:95`) — *"STAY ON TASK. You ONLY help with this clinic … If asked anything unrelated (general trivia, coding, maths, essays, jokes, world facts, personal chit-chat), do NOT answer it. Reply in ONE short line that it's outside what you help with…"*. The student persona has its own equivalent ("gently decline … offer health help instead").

3. **AUTHORIZATION** — enforced *both* in the prompt and in the route:
   - Prompt: `AUTHZ_STAFF` (`saba.ts:98`) — Saba may only use the role data and the one CURRENT PATIENT provided; never reveal/guess any other patient or staff member. `AUTHZ_STUDENT` (`saba.ts:101`) — the record belongs to *this* student only.
   - Route-level enforcement (`route.ts:46-62`) is the real gate: students must be `actor.kind === "student"` and only ever get their own record (`buildStudentContext(actor.id)`); staff must be `actor.kind === "staff"`. **Deep clinical patient context is loaded only for clinical roles (`DOCTOR`, `NURSE`, `MANAGER`) and only for a real `visitId` the user actually opened** — the server resolves the `patientId` from the visit itself (`db.visit.findUnique … select: { patientId }`), *never* from a client-supplied patient id. This closes the "ask about arbitrary MRN" hole.

4. **Clinical-safety framing** — `SAFETY_DOCTOR` (`saba.ts:107`): decision *support*, not a decision maker; never a definitive diagnosis; frame differentials/tests as considerations, flag red flags, note clinical correlation. `SAFETY_STUDENT` (`saba.ts:110`): "a friendly health guide, NOT a doctor. Do not diagnose or prescribe." The chat header also carries an "AI · verify advice" badge (`saba-chat.tsx:118`).

The API also returns clean errors: 401 unauthorized, 403 if the flag is off or persona/role mismatch, 503 if no provider configured (`route.ts:27-34, 48, 51`).

### 2.4 Context builders (how the live snapshot is assembled)
All read-only, all server-side (`saba.ts:161-325`):

- **`buildDoctorContext(patientId)`** — rich clinical snapshot: demographics + age, allergies (with severity), active problems, immunizations, then the **6 most recent visits** each with chief complaint, diagnosis + ICD code, latest vitals (T/HR/BP/SpO2), resulted labs (with abnormal flags), and prescribed meds. This is the copilot's "chart on a page."
- **`buildStaffContext({id, role})`** — a role-tailored live operational snapshot so Saba can answer "what needs my attention":
  - **MANAGER:** patients in clinic now / completed today; who's on leave + pending leave count; stock (low items, batches expiring ≤90d, expired); open POs + pending stock requests.
  - **PHARMACIST:** prescriptions awaiting dispensing; low-stock list; expiry counts (≤90d / expired).
  - **LAB_TECH:** worklist counts by state (ordered / collecting / in-progress / results ready).
  - **HR:** pending leave requests (names); who's currently on leave; staff present today.
  - **STORE_KEEPER:** pending stock requests (item ×qty); open POs; low-medicine count.
  - **NURSE:** patients waiting for a doctor; inpatients on ward; bed occupancy (occupied/total).
  - **RECEPTIONIST:** registered today; waiting for a doctor now.
  - **DOCTOR:** your open patients right now.
  - Shared helper `medStockSummary()` computes low/expiring/expired across medication batches.
- **`buildStudentContext(patientId)`** — patient-appropriate: name, age, known allergies, and last 5 visits (complaint + what they were told). No clinician-only depth.

### 2.5 CTA route map
`ROUTES` (`saba.ts:114-123`) maps each `Role` to the pages it acts on, and the prompt tells Saba to link there for any action. E.g. DOCTOR → `/doctor`, `/patients`, `/visits/[id]`; PHARMACIST → `/pharmacy`, `/pharmacy/inventory`, `/pharmacy/suppliers`; HR → `/hr/leave`, `/hr/attendance`, `/hr/roster`, `/staff`; STORE_KEEPER → `/store`, `/store/requests`, `/store/purchase-orders`, `/store/assets`; etc. Because Saba is read-only, these links are how it "hands off" a *do* action to the human, safely.

---

## 3. Notifications

**Core service:** `src/server/services/events.ts` — `notifyRole(tx, role, {type,title,body,link})` broadcasts to a whole role; `notifyUser(tx, userId, …)` targets one person. Both write `Notification` rows (schema `prisma/schema.prisma:854`, target = `recipientId` and/or `recipientRole`). `NotificationType` enum: `LAB_ORDER_NEW, LAB_RESULTS_READY, DRUG_ORDER_NEW, DRUG_DISPENSED, VISIT_COMPLETED, REFERRAL_ISSUED, ADMISSION, LEAVE_SUBMITTED, LEAVE_DECISION, STOCK_LOW, GENERIC` (`schema.prisma:840`).

**Read side:** `src/server/services/notifications.ts` — `listNotifications`/`unreadCount` fetch rows matching the actor's own inbox **OR** their role broadcast (`recipientWhere`); `markRead`/`markAllRead` flip `readAt`. Notifications are delivered by *role fan-out*, so a new hire in a role instantly inherits that role's queue.

**Live bell (polling):** `src/components/shell/app-shell.tsx` → `NotificationBell`. It seeds from server props, then **polls `notificationSnapshot()` every 25s** and on window focus (`app-shell.tsx:206-235`). New items (not previously "seen") raise a `sonner` toast; the unread badge updates live (caps display at "9+"). `notificationSnapshot()` (`src/app/(app)/notifications/actions.ts`) returns the unread count + latest 8 unread items for the current staff actor. This gives near-real-time delivery without a websocket (see **Future** §6 for true push).

**Which events notify which roles** (emit sites):
| Event | Emitter | Target |
|---|---|---|
| New lab order (`LAB_ORDER_NEW`) | `visit.ts:102` (`order_labs`) | Role **LAB_TECH** |
| Lab results ready (`LAB_RESULTS_READY`) | `lab.ts:69` (`submit_results`) | The **ordering doctor** (`notifyUser`, links to the visit) |
| New prescription (`DRUG_ORDER_NEW`) | `visit.ts:123` (`prescribe`) | Role **PHARMACIST** |
| Visit completed (`VISIT_COMPLETED`) | `pharmacy.ts:94` (final dispense closes visit) | Role **RECEPTIONIST** |
| New admission (`ADMISSION`) | `visit.ts:170` (`admit`) | Role **NURSE** |
| Referral issued (`REFERRAL_ISSUED`) | `referral.ts:50` & `referral.ts:109` (issue / standalone create) | Role **RECEPTIONIST** |
| New leave request (`LEAVE_SUBMITTED`) | `hr.ts` `createLeaveRequest` | Role **HR** |
| Leave decision (`LEAVE_DECISION`) | `hr.ts` (approve/reject/approve_return) | The **employee** (`notifyUser`) |
| New stock request (`GENERIC`) | `store.ts:179` | Role **STORE_KEEPER** |
| Stock request approved/rejected/fulfilled (`GENERIC`) | `store.ts:237` | The **requester** (`notifyUser`) |
| Payment received / invoice settled (`GENERIC`) | `billing.ts:243` | Role **MANAGER** |

Note: `STOCK_LOW` exists in the enum and has a UI icon (`notifications-client.tsx`), but low-stock is currently surfaced *proactively through Saba's context* and dashboards rather than emitted as a standing notification — a natural place to wire a scheduled emitter (**Future**).

---

## 4. Documents & Verification

**Services:** `src/server/services/documents.ts` (issue/fetch), `src/server/services/document-signing.ts` (sign + verify), `src/server/services/qr.ts` (QR + verify URL). **Printouts:** `src/app/print/*`. **Public verification:** `src/app/verify/*`. **Shared letterhead components:** `src/components/print/letterhead.tsx`.

### 4.1 Document types
`DocumentType` enum (`schema.prisma:798`): `SICK_LEAVE, PRESCRIPTION, REFERRAL, LAB_REPORT, ADMISSION_SUMMARY, VISIT_SUMMARY`. Print routes exist for each: `print/sick-leave/[docId]`, `print/prescription/[orderId]`, `print/referral/[id]`, `print/lab/[orderId]`, `print/visit-summary/[visitId]`, `print/discharge/[admissionId]` (admission/discharge summary), plus `print/receipt/[id]` for billing.

Every issued document is an immutable `IssuedDocument` row with a `docNo` (e.g. `DOC-2026-00042`, `nextDocNo()` in `documents.ts:15`) and a **`payload` JSON snapshot** of exactly what was printed — so re-prints reproduce the original even if the underlying record later changes. `issueSickLeave()` captures patient, visit no, diagnosis, dates, days, recommendation, issuer. `issueDocument()` is the generic issuer for the rest. `getOrIssueForVisit()` is idempotent: the single VISIT_SUMMARY / ADMISSION_SUMMARY per visit is created + signed on first print and re-returned thereafter (`documents.ts:148`).

### 4.2 Letterhead system
`Letterhead` (`letterhead.tsx:8`) renders a formal header (logo + `branding.orgName` + `branding.appName` + a contact/subtitle line) reading from `getBranding()` — so **white-label branding flows into every printout**. The print layout (`src/app/print/layout.tsx`) lives *outside* the app shell (no sidebar), renders a screen-only toolbar plus a centered A4-ish white sheet that fills the page cleanly on print. Companion components: `Field`, `SignatureLine`, `VerifySeal`, `DocFooter`.

### 4.3 HMAC signing + verify code + QR (tamper-evidence)
`document-signing.ts`:
- Each document gets a short, human-friendly **verify code** — 10 chars of Crockford base32 (no ambiguous I/L/O/U), displayed grouped as `ABCDE-FGHIJ` (`newVerifyCode`, `formatVerifyCode`, lines 25-36).
- A **HMAC-SHA256 signature** is computed over the document's *immutable facts* (`canonical()` joins docNo|type|patientId|visitId|fromDate|toDate|days|issuedById|issuedAt) keyed by `DOCUMENT_SIGNING_SECRET` (falls back to `AUTH_SECRET`, then a dev default) — `computeSignature`, lines 42-69. `signIssuedDocument()` persists both, retrying on the astronomically-unlikely code clash.
- Referrals are signed **lazily on first print** via `ensureReferralSignature()` with their own canonical string (lines 89-121).
- The printout embeds a **`VerifySeal`**: a QR pointing at `/verify/<code>` (built by `verifyUrlFor()` from the live request origin, `qr.ts`) plus the readable code (`letterhead.tsx:77`).

### 4.4 Public `/verify` (valid / altered / revoked / not-found)
- `src/app/verify/page.tsx` — a public landing where anyone types the printed code; it normalizes and routes to `/verify/<code>`.
- `src/app/verify/[code]/page.tsx` — resolves via `verifyByCode()` and renders one of four states with distinct icon/tone/blurb:
  - **valid** — *"This document was issued by the clinic and has not been altered."*
  - **invalid** — *"The details don't match our records — this document may have been altered. Do not accept it."*
  - **revoked** — issued but since revoked / cancelled.
  - **not_found** — no document matches the code.
- `verifyByCode()` (`document-signing.ts:152`) looks up by code across **both** `IssuedDocument` and `Referral`, checks `revokedAt` / `state === CANCELLED` first (→ revoked), then **recomputes the HMAC from the stored record and compares with a timing-safe equal** (`timingSafeEqual`). A photoshopped certificate whose facts were edited won't recompute to the same signature → **invalid**; a genuine untouched one always verifies → **valid**. This is the tamper-evidence guarantee: verification trusts the server's recomputation, not anything printed on the page.

### 4.5 Selectable-section printouts
- **Sick-leave** (`print/sick-leave/[docId]/page.tsx`) — formal "Medical Certificate / Certificate of Sick Leave" with patient block, rest-from/to dates + day count, optional diagnosis & recommendation, official-stamp circle, physician signature line, and the verify seal.
- **Visit summary** (`print/visit-summary/[visitId]/page.tsx`) — after-visit report: demographics, presenting complaint, assessment/diagnosis (+ICD), latest vitals, ordered labs, prescribed drugs, signed + sealed.
- **Discharge summary** (`print/discharge/[admissionId]/discharge-doc.tsx`) — a **client component with "Include sections:" checkboxes** (`toggle()` at line 41, checkbox list at ~54) so the clinician chooses which blocks (e.g. course, meds, follow-up) appear before printing; computes length-of-stay; signed + sealed. Backed by an idempotent ADMISSION_SUMMARY document.

---

## 5. Workflows

The system's spine is the FSM engine (`src/server/fsm/engine.ts`, machines in `src/server/fsm/machines/*`). Each transition declares `from`/`to` states **and the roles allowed** to fire it; `resolveTransition()` throws unless both the state and the actor's role are valid. Every transition is wrapped in a DB transaction, logged to `StateTransition` (`logTransition`), and often fans out a notification — so the workflow, the audit trail, and the hand-off notification are one atomic act.

### 5.1 Clinical workflow (the visit spine)
Machine: `src/server/fsm/machines/visit.ts`; orchestrator: `src/server/services/visit.ts` (`transitionVisit`). `VisitState`: `REGISTERED → TRIAGE → WAITING_FOR_DOCTOR → IN_CONSULTATION → {WAITING_FOR_LAB | WAITING_FOR_PHARMACY | REFERRED | ADMITTED} → COMPLETED` (or `CANCELLED`). Lab results loop **back** to the doctor rather than closing the visit.

| Step | Event | From → To | Role(s) | Side-effects |
|---|---|---|---|---|
| Registration / intake | *(create)* | → `REGISTERED` | RECEPTIONIST | Patient + visit created (reception; optional SIMS lookup) |
| Triage / vitals | `start_triage` | `REGISTERED → TRIAGE` | NURSE, RECEPTIONIST | Captures `Vitals` |
| Queue to doctor | `send_to_doctor` | `REGISTERED/TRIAGE → WAITING_FOR_DOCTOR` | NURSE, RECEPTIONIST | Assigns `doctorId` |
| Start consult | `begin_consultation` | `WAITING_FOR_DOCTOR → IN_CONSULTATION` | DOCTOR | Claims the visit if unassigned |
| Order labs | `order_labs` | `IN_CONSULTATION → WAITING_FOR_LAB` | DOCTOR | Creates `LabOrder` (ORDERED) → notifies **LAB_TECH** |
| Results back | `lab_results_ready` | `WAITING_FOR_LAB → LAB_RESULTS_READY` | LAB_TECH | Set by lab on submit → notifies ordering **doctor** |
| Re-assess | `resume_consultation` | `LAB_RESULTS_READY / WAITING_FOR_PHARMACY → IN_CONSULTATION` | DOCTOR | Doctor reviews results |
| Prescribe | `prescribe` | `IN_CONSULTATION → WAITING_FOR_PHARMACY` | DOCTOR | Creates `DrugOrder` (ORDERED) → notifies **PHARMACIST** |
| Dispense (close) | `dispensed` | `WAITING_FOR_PHARMACY → COMPLETED` | PHARMACIST | Auto-closed when fully dispensed (see 5.4) → notifies RECEPTIONIST |
| Refer out | `refer` | `IN_CONSULTATION → REFERRED` | DOCTOR | Creates `Referral` (ISSUED) |
| Close referred | `complete` | `REFERRED → COMPLETED` | DOCTOR, RECEPTIONIST | — |
| Admit | `admit` | `IN_CONSULTATION → ADMITTED` | DOCTOR, NURSE | Creates `Admission`, occupies bed → notifies **NURSE** |
| Discharge | `discharge` | `ADMITTED → COMPLETED` | DOCTOR, NURSE | Frees bed; closes visit (see wards) |
| Complete | `complete` | `IN_CONSULTATION → COMPLETED` | DOCTOR | Writes diagnosis/ICD, sets `closedAt` |
| Cancel | `cancel` | early states → `CANCELLED` | MANAGER, RECEPTIONIST | Records reason |

**Lab sub-flow** (`machines/lab-order.ts`, `services/lab.ts`): `ORDERED → COLLECTING → IN_PROGRESS → RESULTS_READY → COMPLETED` (LAB_TECH; complete also DOCTOR; cancel LAB_TECH/MANAGER). On `submit_results` the tech records per-item values/flags and, if the visit is `WAITING_FOR_LAB`, flips it to `LAB_RESULTS_READY` and notifies the ordering doctor (`lab.ts:43-77`).

**Pharmacy sub-flow** (`machines/drug-order.ts`, `services/pharmacy.ts`): `ORDERED → PARTIALLY_DISPENSED → DISPENSED` (or `CANCELLED`), PHARMACIST-driven. See 5.4 for FEFO/stock detail.

### 5.2 HR leave workflow
Machine: `machines/leave.ts`; service: `services/hr.ts`. `SUBMITTED → APPROVED → ACTIVE → RETURN_REQUESTED → RETURNED`; also `REJECTED`, `CANCELLED`. Roles: **HR, MANAGER** approve/reject/activate/approve_return.
- **Request:** `createLeaveRequest` creates SUBMITTED → notifies role **HR**.
- **Approve/Reject:** stamps `approverId` + decision comment → notifies the **employee** (`LEAVE_DECISION`).
- **On-leave lockout:** `activate` sets the employee's `employmentStatus = ON_LEAVE` (`hr.ts`), which locks their login while away.
- **Return:** `approve_return` (or cancel/reject of an ACTIVE leave) restores `employmentStatus = ACTIVE` and stamps `returnedAt`. So the leave FSM directly drives account access — a clean example of process → security coupling.

### 5.3 Store / procurement workflows
Service: `services/store.ts`.
- **Stock request:** `machines/stock-request.ts` — `SUBMITTED → APPROVED → FULFILLED` (or `REJECTED`). `createStockRequest` notifies **STORE_KEEPER**; each decision notifies the requester back. Roles: STORE_KEEPER, MANAGER (fulfill = STORE_KEEPER).
- **Purchase order → goods receipt:** `createPurchaseOrder` (state `ORDERED`, computes total); `receivePurchaseOrder` increments each line's `received` and moves the PO to `RECEIVED` (all in) or `PARTIALLY_RECEIVED`; `cancelPurchaseOrder` for open POs. Every step logs a `StateTransition` + audit entry.
- **Assets:** `addAsset`/`updateAsset`, `assignAsset` (ASSIGNED, notifies recipient), `returnAsset` (RETURNED / LOST / DAMAGED). Asset lifecycle is tracked via `AssetAssignment` + transition log.
- Full chain: **stock request → approval → purchase order → goods receipt** (and separately, medicine goods-in via pharmacy `receiveStock`).

### 5.4 Pharmacy stock (batch / expiry / FEFO)
Service: `services/pharmacy.ts`.
- **Batches & expiry:** stock is held in `MedicationBatch` rows (batchNo, expiryDate, quantity, cost/sell price, supplier). `receiveStock` books a batch and a `RECEIVE` stock movement.
- **FEFO dispensing:** `dispenseFromBatches()` decrements from batches **earliest-expiry-first** (`orderBy: { expiryDate: "asc" }`), writing a negative `DISPENSE` `StockMovement` per batch for a full audit trail (`pharmacy.ts:27-49`). Partial fills mark items `PENDING`/`OUT_OF_STOCK`; full fills → `DISPENSED`.
- **Visit auto-close:** when a drug order is fully dispensed and its visit is `WAITING_FOR_PHARMACY`, the visit is flipped to `COMPLETED` and RECEPTIONIST is notified — pharmacy is the last stop (`pharmacy.ts:91-95`).
- **Low-stock / expiry awareness:** computed on demand (`medStockSummary()` in `saba.ts`: on-hand ≤ reorder level = low; batches expiring ≤90d; expired) and surfaced through Saba + management dashboards.

### 5.5 Wards / admissions & other machines
- **Admission** (`machines/admission.ts`, `services/ward.ts`): `ADMITTED → ON_WARD` (`settle`, NURSE), `→ DISCHARGED` (`discharge`, DOCTOR/NURSE; frees bed + closes the originating visit), `→ CANCELLED`. `transferBed` moves a patient between beds with occupancy bookkeeping. `wardOccupancy()` produces the live per-ward bed map + occupancy %.
- **Referral** (`machines/referral.ts`): `DRAFT → ISSUED → ACKNOWLEDGED → COMPLETED` (or `CANCELLED`); issue notifies RECEPTIONIST.
- **Invoice / billing** (`machines/invoice.ts`, `services/billing.ts`): `generateInvoiceForVisit` builds a DRAFT invoice (consultation fee + one line per lab test + per drug item at latest batch sell price). `DRAFT → ISSUED → PARTIALLY_PAID → PAID` (or `VOID`), RECEPTIONIST/MANAGER (void = MANAGER). `recordPayment` posts a `Payment`, advances state, and notifies MANAGER.
- **Appointment** (`machines/appointment.ts`): `SCHEDULED → CONFIRMED → CHECKED_IN → COMPLETED`, plus `NO_SHOW` / `CANCELLED`.

**Audit everywhere:** `logTransition` writes every FSM move to `StateTransition`; `audit()` writes general activity to `AuditLog` (best-effort, never breaks the primary op) — `events.ts`. This underpins the `platform.audit_log` feature.

---

## 6. Integrations & Future Ecosystem

### 6.1 Existing integrations
- **SIMS student lookup** — `src/server/integrations/sims/index.ts`. A **pluggable adapter** (`SimsProvider` interface with `lookup(studentId)`). Two implementations ship: a deterministic **mock** provider (stable hash → same synthetic student every time, for demos) and an **http** provider that GETs `\${SIMS_BASE_URL}/students/{id}` with a bearer key and maps the payload to the internal `SimsStudent` shape. Selected by env: `SIMS_PROVIDER=http` + `SIMS_BASE_URL` + `SIMS_API_KEY` — "go live without touching any calling code." Gated by `clinical.sims_lookup`. Lets reception pull a student's demographics/college/program/blood type/emergency contact by ID instead of retyping.
- **AI providers (Saba)** — the same pluggable pattern via OpenAI-compatible endpoints (Groq / OpenAI / Ollama / custom gateway), env-selected (§2.1). Runs fully on-prem with Ollama (no data leaves the clinic), or on a hosted model for quality.
- **White-label branding** — `getBranding()` + `brandingCss()` (`services/settings.ts`) inject org name, app name, and theme colours (primary, hover, gold, sidebar) into the live layout and every printout, enabling multi-tenant / other-facility deployments.

### 6.2 Future connectors (clearly aspirational)
These are natural extensions of the existing pluggable-adapter + FSM + signed-document foundations. **(Future)** in all cases:
- **Deeper SIMS / registrar integration** — beyond lookup: write-back of clinic-issued sick-leave to the registrar, enrolment/eligibility checks, automatic student-status sync. The `SimsProvider` interface is the seam.
- **National HMIS / DHIS2 health-information exchange** — export aggregate indicators (visits, diagnoses by ICD-10, immunizations) to the national DHIS2 / HMIS; the ICD-10 coding and structured visit data already exist to feed it.
- **Insurance / payments** — plug the billing module into insurance eligibility + claims and into payment gateways / telebirr-style mobile money; the invoice FSM (`ISSUED → PARTIALLY_PAID → PAID`) and `Payment` records are the integration points.
- **Telemedicine** — remote consultation channel layered onto the visit spine (a virtual `IN_CONSULTATION`), reusing the same ordering/prescribing/referral machinery.
- **Real-time broadcasting** — replace the 25s bell polling (`app-shell.tsx`) with websockets / SSE / a pub-sub so notifications, queues, and ward boards update instantly across stations.
- **Analytics / BI exports** — the `StateTransition` + `AuditLog` + domain tables are a ready warehouse feed; export to a BI tool for throughput, turnaround-time, and utilization dashboards beyond the built-in reports.
- **Verification as a public trust service** — the `/verify` HMAC scheme can extend to third-party verifiers (employers, faculty) and to signed QR on any future document type.

### 6.3 How existing features plug into a broader campus digital ecosystem
Each module already exposes a clean seam for campus-wide integration: **SIMS** ties the clinic to the student information system; **signed documents + `/verify`** give faculty/employers a trust endpoint for clinic-issued certificates; **HR leave ↔ `employmentStatus` lockout** models the same access-control pattern the campus IAM could federate; **billing** is the hook for campus finance/insurance; **feature flags + white-label branding** let the same platform serve other university health centres as a multi-tenant campus service. The FSM engine means any new campus workflow (e.g. a registrar approval) is added as one declarative machine with role-gated transitions, audit, and notifications for free.

---

*Verified against source on branch `feature/platform-v2`. Key files: `src/lib/features.ts`, `src/server/ai/saba.ts`, `src/app/api/saba/route.ts`, `src/components/saba/*`, `src/server/services/{events,notifications,visit,lab,pharmacy,referral,hr,hr-ops,store,ward,billing,documents,document-signing,qr,settings}.ts`, `src/server/fsm/machines/*`, `src/server/integrations/sims/index.ts`, `src/app/print/*`, `src/app/verify/*`, `src/components/print/letterhead.tsx`, `src/components/shell/app-shell.tsx`.*
