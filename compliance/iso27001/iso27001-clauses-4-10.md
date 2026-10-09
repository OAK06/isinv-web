# ISO/IEC 27001:2022 — Clauses 4–10 Coverage

## Purpose

ISO/IEC 27001 Clauses 4–10 are the **mandatory management-system requirements** — every
certified organization must satisfy all of them, regardless of which Annex A controls it selects.
This document maps each clause to how GymFlyte's ISMS satisfies it, referencing the existing
policy pack rather than restating it, and is explicit about which parts are documented intent
versus an operating, evidenced process.

## Scope

Covers Clauses 4 through 10 of ISO/IEC 27001:2022. Annex A control-level coverage is in
`statement-of-applicability.md`; the risk process referenced under Clause 6 is detailed in
`../risk-assessment-policy.md` and `risk-treatment-plan.md`.

## Clause 4 — Context of the Organization

Requires understanding the organization's context, interested parties, and defining the ISMS
scope. This is satisfied by `isms-scope.md`, which defines the organizational boundary (UBQ Solutions FZ-LLC operating GymFlyte), the in-scope systems (matching
`../information-security-policy.md`'s scope), interested parties and their requirements, and
explicit exclusions (physical facilities, tenant-side hardware, card data).

## Clause 5 — Leadership

Requires top-management commitment, an information security policy, and clearly assigned roles
and responsibilities. `../information-security-policy.md` is the top-level security policy,
establishing that security is a shared responsibility across engineering rather than a
bolted-on afterthought, and every policy in the pack carries an explicit **Roles &
Responsibilities** section naming **Founder & CTO, UBQ Solutions FZ-LLC** as the accountable
owner. Given the company's size, top management and the ISMS owner are the same person — this is
disclosed rather than obscured, and is normal for an organization at this scale.

## Clause 6 — Planning

Requires risk assessment and risk treatment addressing the ISMS scope, information security
objectives, and planning to achieve them. `../risk-assessment-policy.md` defines the assessment
cadence (annual plus event-triggered), the risk register, likelihood × impact scoring, and
treatment/acceptance criteria; `risk-treatment-plan.md` in this folder applies that process to
the current top risks (single-node/no-HA, no MFA, no alerting, sub-processor dependency) with
named treatment actions and owners. Information security objectives are implicit in the top gaps
already tracked in `../iso-27001-27701-readiness.md` (MFA enforcement, monitoring/alerting, HA,
CI gate enablement, verified restore testing) — **still to be operationalised**: formally
restating these as time-bound, measurable ISMS objectives reviewed at management review, rather
than only as a checklist.

## Clause 7 — Support

Requires resources, competence, awareness, communication, and control of documented information.
Resourcing and competence are addressed through role definitions in the policy pack (e.g.
Incident Commander, Deploying Engineer in `../change-management-policy.md` and
`../incident-response-plan.md`) and the annual security-training commitment in
`../information-security-policy.md`. Documented information control is this policy pack itself —
version-controlled files with an explicit owner and **Review Cadence** section per document.
**Still to be operationalised**: a documented security-awareness training record (who completed
it and when) beyond the policy commitment to deliver it annually.

## Clause 8 — Operation

Requires operational planning and control of the processes needed to meet ISMS requirements,
including outsourced processes. This is satisfied day-to-day by `../change-management-policy.md`
(version control, mandatory review, CI gates, staging validation, rolling deploys, rollback),
`../access-control-policy.md` (provisioning/deprovisioning, quarterly access review), and
`../vendor-and-subprocessor-management.md` for outsourced/third-party processes (Stripe,
DigitalOcean, SMTP2GO). Risk treatment execution against the register is tracked in
`risk-treatment-plan.md`.

## Clause 9 — Performance Evaluation

Requires monitoring/measurement/analysis/evaluation, internal audit, and management review.
Monitoring of control state currently happens through the quarterly review cadence on
`../iso-27001-27701-readiness.md`, which tracks each control's status (Have/Partial/Gap) over
time — this is the closest existing equivalent to ISMS performance monitoring. **Still to be
operationalised**: (1) a **formal internal audit programme** — a scheduled, independent review of
ISMS conformance distinct from the owner's own quarterly checklist refresh, since Clause 9.2
expects the internal audit to be objective; and (2) a **management review meeting on a fixed
cadence** (recommended: aligned with the annual policy review cycle, at minimum annually) with a
defined agenda (risk register status, incident summary, audit results, objective progress,
resourcing needs) and a documented output, rather than the current continuous-but-informal review
implicit in the owner reviewing and updating each policy.

## Clause 10 — Improvement

Requires handling nonconformities with corrective action, and continual improvement of the ISMS.
`../incident-response-plan.md`'s blameless post-mortem process (written within 5 business days of
a SEV1/SEV2, capturing root cause and remediation items with owners and due dates) is the existing
corrective-action mechanism for security incidents. `../risk-assessment-policy.md`'s living risk
register and `../iso-27001-27701-readiness.md`'s Gap → Partial → Have progression are the existing
continual-improvement mechanisms for control maturity. **Still to be operationalised**: a
nonconformity log that also captures process/documentation nonconformities surfaced outside an
incident (e.g. found during a future internal audit), not only incident post-mortems — today,
non-incident nonconformities are handled informally rather than logged and tracked to closure.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns ISMS leadership commitment (Clause 5), the risk
  and objective-setting process (Clause 6), and is accountable for standing up internal audit and
  management review as formal, scheduled processes (Clause 9).
- **All engineers**: responsible for following the operational controls in Clause 8's referenced
  policies and reporting nonconformities/incidents as they're found (Clause 10).

## Review Cadence

Reviewed **annually**, and whenever a clause's supporting policy or process changes materially.
Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.
