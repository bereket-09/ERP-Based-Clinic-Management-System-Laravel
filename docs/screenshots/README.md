# Screenshots

The main `README.md` references the images below. Add a PNG for each filename and it
will appear automatically. Capture at a desktop width (~1440px) for crisp results.

| File | Page / how to reach it | Sign in as |
|---|---|---|
| `landing.png` | `/` — the public landing hero | (logged out) |
| `login.png` | `/login` — split-view sign in | (logged out) |
| `admin-dashboard.png` | `/home` — stat cards + visit-flow chart | `admin@clinic.test` |
| `treat-workspace.png` | `/treat/{visit}` — consult workspace (open a queued patient) | `doctor@clinic.test` |
| `patient-registration.png` | search a *new* student ID on `/search_patient` → registration form | `reception@clinic.test` |
| `patient-record.png` | search an *existing* student ID → patient record + history | `reception@clinic.test` |
| `patients-list.png` | `/all_patients` | `reception@clinic.test` |
| `notifications.png` | any page — open the header 🔔 bell dropdown | `doctor@clinic.test` |

Tip: seed demo data first (`php artisan db:seed`) so the screens are populated, then
use the demo accounts listed in the main README.
