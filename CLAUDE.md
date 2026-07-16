# Seed & Spoon — Platform Index

## Stack

Next.js 15 (App Router) · Supabase (Auth + Postgres + RLS) · Tailwind CSS · Vercel edge deployment · Resend (transactional email) · Stripe (donations)

Package manager: **npm**. (Not Bun — Bun had compatibility conflicts with this Next.js setup. Some stray Bun-era files/docs may still be in the repo pending cleanup; npm is the source of truth.)

## Repository layout

```
app/                    Pages and API routes (App Router)
components/             React components by domain
data/                   Data-driven configs (assessment domains, form sections)
lib/                    Shared utilities (Supabase clients, SpoonAssist engines)
supabase/migrations/    Ordered SQL migrations (applied via Supabase MCP)
supabase/seed.sql       Seed data for local dev
public/                 Static assets, sitemap
emails/templates/       Resend email templates
```

## Environment

See `.env.example`. Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`.

Build: `npm run build` · Dev: `npm run dev` · No test suite yet (SpoonAssist has `__tests__/spoonassist/`).

---

## Backend systems

### 1. Participant Survey (5 Loaves pilot)

Tracks food security, dietary diversity, and program satisfaction across three phases (baseline → weekly check-in → endline) with Likert scales and conditional branching.

| Layer | Path |
|-------|------|
| Migration | `supabase/migrations/20260617100001_create_five_loaves_survey.sql` |
| API | `app/api/surveys/route.js` |
| Page | `app/survey/page.jsx` |
| Components | `components/survey/{SurveyPage,BaselineSurvey,WeeklyCheckin,EndlineSurvey}.jsx` |

**Tables:** `survey_responses` · **Views:** `survey_metrics` (computed baseline→endline deltas)

---

### 2. Intake Enrollment (family intake)

Family-level enrollment with household composition, per-child dietary/texture/medical needs, Big 9 + sesame allergen matrix (severity: I/A/S), delivery logistics, SNAP/WIC eligibility, and auto-calculated caloric needs.

| Layer | Path |
|-------|------|
| Migration | `supabase/migrations/20260617100002_create_five_loaves_intake_enrollment.sql` |
| API | `app/api/enrollment/route.js` |
| Page | `app/enrollment/page.jsx` |
| Components | `components/enrollment/{IntakeEnrollmentPage,IntakeEnrollmentForm,AllergenMatrix}.jsx` |

**Tables:** `household_enrollments`, `household_children`, `allergen_flags` · **Views:** `kitchen_allergen_summary` (production label render), `severe_allergen_households`

---

### 3. Board Governance Assessment

Anonymized self-assessment across 9 governance domains with 36 rated statements (SD/D/A/SA/DK), free-text reflections, and action planning. Responses keyed by `respondent_token` with no joinable identity.

| Layer | Path |
|-------|------|
| Migration | `supabase/migrations/20260617100003_create_board_governance_assessment.sql` |
| API | `app/api/governance/route.js`, `app/api/governance/assess/route.js` |
| Pages | `app/governance/assess/page.jsx`, `app/governance/dashboard/page.jsx` |
| Components | `components/governance/{AssessmentForm,ResultsDashboard,AdminPanel}.jsx` |
| Data config | `data/boardAssessment.js` — 9 domains, 36 statements, text prompts |

**Tables:** `assessments`, `assessment_invites`, `assessment_responses`, `assessment_ratings`, `assessment_texts` · **Views:** `assessment_statement_results` (rating distribution + favorable_share + needs_attention flags), `assessment_participation`

**Domains:** mission, roles, composition, finance, fundraising, ED partnership, compliance, meetings, community

**Anonymity boundary:** `assessment_invites` holds `board_member_id`; `assessment_responses` holds only `respondent_token`. No join path exists by design.

---

### 4. Volunteer Onboarding (v2 architecture)

Per-role eligibility model. `volunteers.status` = account lifecycle (invited → in_progress → submitted → active → needs_info). `volunteer_role_assignments.eligibility_status` = per-role (pending | eligible | restricted | denied). A volunteer can be active with some roles eligible while others remain pending.

| Layer | Path |
|-------|------|
| Migrations | `supabase/migrations/20260617100004_create_volunteer_onboarding_system.sql` (v1, superseded) |
| | `supabase/migrations/20260617100005_volunteer_onboarding_v2_architecture_review.sql` (v2) |
| API | `app/api/volunteer/onboard/route.js` — invite, submit, status, role eligibility, bg check, driver, notes |
| | `app/api/volunteer/onboard/guardian/route.js` — independent guardian consent |
| | `app/api/volunteer/onboard/hours/route.js` — hours logging, verification, court-ordered letters |
| Pages | `app/volunteer/onboard/page.jsx`, `app/volunteer/onboard/guardian/page.jsx`, `app/volunteer/admin/page.jsx` |
| Components | `components/volunteer/{OnboardingForm,VolunteerAdminPanel}.jsx` |
| Data config | `data/volunteerOnboarding.js` — form sections, status flow, eligibility statuses, hours purposes |

**Tables (18):** `volunteers` (altered), `volunteer_roles`, `volunteer_role_assignments`, `volunteer_role_preferences`, `volunteer_hours_purpose`, `volunteer_hours_log`, `verification_letters`, `volunteer_guardian`, `volunteer_accommodations`, `volunteer_emergency_contacts`, `volunteer_availability`, `volunteer_languages`, `volunteer_notes`, `volunteer_audit_log`, `volunteer_driver_verification`, `volunteer_minor_id`, `volunteer_consents`, `volunteer_background_check`

**Views:** `volunteer_review_queue`, `volunteer_hours_summary`

**Seeded roles (5):** packing, kitchen, driving, outreach, admin — each with metadata flags: `requires_driver_verification`, `requires_background_check`, `allows_minors`, `requires_food_safety_ack`

#### Key design decisions

- **Per-role eligibility replaces wholesale status gating.** Role assignments computed at submit time based on role metadata: requires bg check → pending, requires driver → pending, minor + !allows_minors → restricted, otherwise → eligible.
- **Guardian consent is independent.** On submit, Resend emails the guardian a unique `consent_token` link. The guardian's page captures IP, timestamp, and consent version from the guardian's own click. Not a self-checkbox.
- **Background check stores outcome only.** Per-component tracking (CHRI/SOR/CARI), each with its own status. `cleared` is derived when all components clear. Never store raw criminal history, registry detail, or CARI content.
- **Auto-upgrade:** When bg check clears → child-access role assignments upgrade. When guardian consents → minor's pending role assignments upgrade.
- **Court-ordered hours:** Only an authorized staffer may mark verified. Verification letter is a legal document — accuracy is non-negotiable.
- **Driver verification:** NJ-licensed only. DO-21A notarized authorization + DO-21 abstract. Org pulls the record; no self-upload.
- **Audit log:** Immutable, append-only. RLS: insert + read for service_role, read for authenticated. No update, no delete.
- **Accommodations/disability data:** Voluntary, confidential. Framed as "what helps you / what to avoid," never a diagnosis.

---

## Operational documents

| Document | Location | Notes |
|----------|----------|-------|
| Capability statement | `public/documents/seed-and-spoon-capability-statement.pdf` | Org overview for funders/partners |
| Research paper | `public/documents/SeedAndSpoon ModernizingHungerRelief 2026.pdf` | Zenodo DOI: 10.5281/zenodo.20299779 |
| Food safety waiver | `app/legal/food-waiver/page.jsx` | Good Samaritan Act, allergen risks, emergency procedures |
| Non-discrimination | `app/legal/non-discrimination/page.jsx` | Title VI/IX, Section 504, ADA, NJ LAD |
| Privacy policy | `app/legal/privacy/page.jsx` | Data retention: 7yr donations, 3yr volunteers |
| Donor privacy | `app/legal/donor-privacy/page.jsx` | PCI-DSS via Stripe, tax doc retention |
| Cookie policy | `app/legal/cookies/page.jsx` | Strictly necessary + analytics + third-party |
| Terms of service | `app/legal/terms/page.jsx` | Site use, program participation, liability |

---

## Security and data handling

- **RLS on every table.** Service role for writes; authenticated for reads where appropriate. Audit log has no update/delete policies.
- **Token-based public forms.** Onboarding, guardian consent, and survey forms validate a signed token before rendering. No authenticated session required for form submission.
- **Sensitive data isolation.** Accommodations, background check outcomes, and guardian consent records are in separate tables with tighter RLS. Background checks store pass/fail only.
- **Anonymized governance.** Assessment responses cannot be joined back to board member identity by design.
- **Allergen severity tracking.** Per-child, per-allergen, with kitchen-facing summary views for production labels.

---

## Conventions

- API routes use `action` field in POST body for multi-operation endpoints (e.g., `invite`, `submit_onboarding`, `update_status`)
- Data-driven form configs live in `data/` — roles, assessment domains, and form sections are defined there, not hardcoded in components
- Migrations are numbered `YYYYMMDDHHMMSS_*` and applied via Supabase MCP `apply_migration`
- Components follow `components/{domain}/{ComponentName}.jsx` pattern
- All sensitive admin actions write to the relevant audit log
