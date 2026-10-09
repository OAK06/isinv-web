# Risk Assessment Policy

## Purpose

Define how GymFlyte identifies, scores, and treats risks to the confidentiality, integrity, and
availability of the systems and data it operates, so that risk decisions are made deliberately
rather than discovered by accident.

## Scope

Covers technical risk (infrastructure, application, third-party), operational risk (process,
personnel), and compliance risk (GDPR, contractual obligations) across the full GymFlyte
platform: `GymFlyteBack`, `GymFlyteFront`, the PostgreSQL database, DigitalOcean Spaces, the
Kubernetes cluster, and sub-processors.

## Policy Statements

### Assessment cadence

- A formal risk assessment is conducted **annually**, covering the full scope above.
- Assessments are also **event-triggered**, run outside the annual cycle whenever: a new
  sub-processor or major dependency is introduced, a material architecture change occurs (e.g.
  new hosting region, new auth mechanism), a SEV1/SEV2 incident occurs (per
  `incident-response-plan.md`), or a new regulatory obligation applies to the business.

### Risk register

- Identified risks are recorded in the risk register at **this `compliance/` folder**, with:
  description, affected asset/system, likelihood, impact, resulting score, owner, treatment
  decision, and status.
- The register is a living document — new risks are added as they're identified, not only during
  the formal assessment window; existing entries are updated when their likelihood, impact, or
  treatment status changes.

### Scoring

- Risks are scored on a **likelihood × impact** matrix, each rated 1–5:
  - **Likelihood**: 1 (rare) to 5 (near-certain / already observed).
  - **Impact**: 1 (negligible) to 5 (severe — data breach, extended multi-tenant outage,
    regulatory exposure).
- A resulting score of 15+ (of 25) is treated as **high priority** and requires a documented
  treatment plan with an owner and target date; scores below that may be accepted per the
  criteria below but remain tracked in the register.

### Treatment & acceptance

- Each identified risk is assigned one of: **mitigate** (reduce likelihood/impact via a control),
  **transfer** (e.g. insurance, contractual risk-shifting to a vendor), **avoid** (stop the
  activity that creates the risk), or **accept** (documented, deliberate decision to proceed
  without further mitigation).
- Risk acceptance requires sign-off from **Founder & CTO, UBQ Solutions FZ-LLC** and is
  recorded in the register with the reasoning — an accepted risk is not silently dropped from
  tracking.
- The current single-node Kubernetes cluster (no HA) is an example of a documented, accepted risk
  with an active remediation plan — see `business-continuity-and-dr.md` for the specifics.

### Links to other policies

- Risks around unauthorized access are addressed via `access-control-policy.md`.
- Risks around data loss/outage are addressed via `business-continuity-and-dr.md`.
- Risks introduced by third parties are addressed via `vendor-and-subprocessor-management.md` and
  feed this register on the same cadence.
- Realized risks (incidents) feed back into the register via the post-mortem process in
  `incident-response-plan.md`.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns the risk register, facilitates the annual
  assessment, and approves risk-acceptance decisions.
- **All engineers**: responsible for surfacing newly identified risks to the risk owner as they're
  discovered, rather than waiting for the annual cycle.
- **Founder & CTO, UBQ Solutions FZ-LLC**: informed of high-priority (score 15+) risks and their treatment plans.

## Review Cadence

Full assessment **annually**; register reviewed for currency **quarterly**. Owned by
**Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Clause 6.1 (Actions to Address Risks and Opportunities — risk assessment and risk
treatment), the output of which is the Statement of Applicability
(`iso27001/statement-of-applicability.md`) and `iso27001/risk-treatment-plan.md`.
