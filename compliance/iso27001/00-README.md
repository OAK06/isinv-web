# ISO/IEC 27001:2022 ISMS — GymFlyte

## What this is

This folder is the **Information Security Management System (ISMS)** documentation for
**GymFlyte**, operated by **UBQ Solutions FZ-LLC** (Ras Al Khaimah, United Arab Emirates), built
to the ISO/IEC 27001:2022 standard, extended by **ISO/IEC 27701:2019** (the Privacy Information
Management System addition — see `iso27701-mapping.md`) to cover GymFlyte's GDPR and UAE PDPL
obligations. It sits alongside — and deliberately reuses — the policy pack in the parent
`compliance/` folder rather than duplicating it. The ISMS is **established and being operated
toward certification**: the management-system structure, risk process, and control set required
by the standard are in place and in use; a certification-body audit has not yet been scheduled or
completed.

## What ISO/IEC 27001:2022 actually is

ISO/IEC 27001 is a **certifiable management-system standard**, not a report. It specifies
requirements for establishing, implementing, maintaining, and continually improving an ISMS —
the governance layer around information security (risk assessment, objectives, roles, internal
audit, management review, corrective action) — plus a reference set of security controls in
**Annex A** that the organization selects from based on its own risk assessment.

Certification is issued by an **accredited certification body** (a third party independently
accredited to certify against ISO 27001, distinct from a consultancy) through a two-stage
external audit:

- **Stage 1 — documentation review**: the certification body reviews the ISMS documentation
  (scope, policies, risk assessment, Statement of Applicability) for completeness and readiness
  before any control testing happens.
- **Stage 2 — implementation audit**: the certification body tests whether the documented
  controls are actually operating in practice — interviews, evidence sampling, walkthroughs.

A successful Stage 2 audit results in a **certificate**, valid for a **3-year cycle**, with
**annual surveillance audits** in the intervening years to confirm the ISMS is still being
operated, and a recertification audit at the end of the cycle.

## How this differs from SOC 2

SOC 2 is not part of GymFlyte's assurance strategy (this ISMS's own condensed readiness view is
`../iso-27001-27701-readiness.md`; the financial-reporting-relevant assurance framework is
ISAE 3402, in `../isae3402/`). SOC 2 is retained here purely as a comparison, because it is the
framework most often confused with ISO/IEC 27001 — the two cover overlapping ground but are
structurally different:

| | ISO/IEC 27001 | SOC 2 |
|---|---|---|
| What it is | A **management-system standard** — you build and run an ISMS, then get it independently certified | An **attestation engagement** — a CPA firm observes controls operating and issues a report of their findings |
| Output | A **certificate** (pass/fail, valid 3 years + annual surveillance) | A **report** (Type I point-in-time, or Type II over an observation window, typically 3–12 months) — not a certificate |
| Assessor | An accredited certification body | A licensed CPA firm |
| Scope of what's assessed | The whole management system (policy, risk process, objectives, internal audit, management review) *plus* Annex A controls selected via risk assessment | A fixed set of Trust Services Criteria (Security mandatory; Availability, Confidentiality, Processing Integrity, Privacy optional) |
| Recognition | Internationally recognized standard, common in EU/UK/APAC enterprise procurement | Most recognized in North America |

## The ~80% control overlap — why this ISMS reuses the existing policy pack

ISO 27001 Annex A and the SOC 2 Common Criteria cover largely the same underlying security
practices — access control, change management, incident response, vendor management, backup and
continuity, encryption, logging — described in different structures. In practice, an
organization that has already built a SOC 2-oriented policy pack has already implemented roughly
**80% of what Annex A requires**; the remaining work is mostly structural: a formal ISMS scope
statement, explicit management-system clauses (context, objectives, internal audit, management
review), and a **Statement of Applicability** mapping every Annex A control to that existing
control set.

That is exactly what this folder does. It does **not** re-describe controls the parent pack
already owns — `statement-of-applicability.md` points each Annex A control back to the relevant
file in `../` (e.g. `../access-control-policy.md`, `../incident-response-plan.md`,
`../business-continuity-and-dr.md`) rather than restating their content here.

## Files in this folder

| File | Covers |
|---|---|
| `isms-scope.md` | ISMS scope statement — what's in scope, interested parties, exclusions |
| `iso27001-clauses-4-10.md` | Coverage of mandatory management-system clauses 4–10 |
| `statement-of-applicability.md` | The SoA — all 93 Annex A:2022 controls, applicability, status, and reference |
| `risk-treatment-plan.md` | Risk-treatment table for the top risks, tied to `../risk-assessment-policy.md` |
| `iso27701-mapping.md` | ISO/IEC 27701 (PIMS) mapping — extends this ISMS to GDPR/PDPL controller and processor obligations |

## Ownership and governance

This ISMS documentation is owned and maintained by **Founder & CTO, UBQ Solutions FZ-LLC**, who
is responsible for keeping it current, ensuring the controls it describes are implemented, and
approving changes. Claims of external certification must not be made until an accredited
certification body has issued the certificate.

## Review Cadence

This folder is reviewed **annually**, and whenever the ISMS scope, Annex A control set, or a
referenced policy changes materially. Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.
