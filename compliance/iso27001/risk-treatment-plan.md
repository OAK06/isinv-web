# Risk Treatment Plan

## Purpose

Apply the risk-assessment process defined in `../risk-assessment-policy.md` to GymFlyte's current
highest-priority risks, recording the treatment decision, planned action, and owner for each — the
ISO/IEC 27001 Clause 6.1.3 output that turns the risk register into concrete, assigned work.

## Scope

Covers the top risks currently identified against the ISMS scope in `isms-scope.md`, scored on
the likelihood × impact matrix defined in `../risk-assessment-policy.md` (1–5 each; 15+ of 25 is
high priority). This is not the full risk register — it is the subset that already has an
assigned treatment plan; the full register is maintained per `../risk-assessment-policy.md`.

## Risk treatment table

| Risk | Likelihood | Impact | Score | Treatment | Planned action | Owner |
|---|---|---|---|---|---|---|
| **Single-node Kubernetes cluster, no HA** — a node failure or resource-exhaustion event causes a full outage of both API and frontend for all tenants simultaneously | 3 | 5 | 15 | Mitigate | Evaluate and move to a multi-node pool with pod anti-affinity once load/budget justifies it; interim mitigation is active node-resource monitoring (`kubectl top nodes`) and prompt node upsizing when utilization is tight, per `../business-continuity-and-dr.md` | Founder & CTO, UBQ Solutions FZ-LLC |
| **No MFA on admin/owner accounts** — a compromised platform Super Admin or tenant Owner credential grants the attacker the highest level of access with only a password as the barrier | 3 | 5 | 15 | Mitigate | Enforce TOTP-based MFA for platform Super Admin and tenant Owner roles, target before Q4 2026, per `../access-control-policy.md` | Founder & CTO, UBQ Solutions FZ-LLC |
| **No error monitoring / alerting** — incidents are currently detected only via audit-log review or user report, delaying detection and extending the containment window in `../incident-response-plan.md` | 4 | 3 | 12 | Mitigate | Wire in an error-monitoring/alerting tool (e.g. Sentry) and an uptime monitor for both the API and frontend, feeding the Incident Commander's 1-hour triage target directly | Founder & CTO, UBQ Solutions FZ-LLC |
| **Sub-processor dependency (Stripe, DigitalOcean, SMTP2GO)** — a breach or extended outage at a sub-processor propagates directly to GymFlyte's availability or data confidentiality, with GymFlyte contractually bound to treat it as its own for notification purposes | 2 | 4 | 8 | Accept, with mitigation via due diligence | Continue enforcing DPA/SCC requirements before go-live and the quarterly sub-processor list review; no realistic alternative to these providers at current scale, so residual dependency risk is accepted rather than avoided, per `../vendor-and-subprocessor-management.md` | Founder & CTO, UBQ Solutions FZ-LLC |
| **Backup restore not yet verified on a fixed schedule** — an untested restore process means the documented 24h RPO/RTO targets in `../business-continuity-and-dr.md` are assumptions, not validated capabilities | 2 | 4 | 8 | Mitigate | Establish a quarterly scheduled restore-to-scratch-environment test with logged results, per `../business-continuity-and-dr.md` | Founder & CTO, UBQ Solutions FZ-LLC |

## Treatment rationale

- The two score-15 risks (no HA, no MFA) are the ISMS's current highest priority per the
  15+ threshold in `../risk-assessment-policy.md`, matching the top two items in
  `../iso-27001-27701-readiness.md`'s "Top gaps to close first."
- Sub-processor dependency is **accepted** rather than mitigated to zero because avoiding it
  (self-hosting payments, database, or email infrastructure) would introduce materially greater
  risk and cost than it removes at GymFlyte's current scale — this is a deliberate, documented
  acceptance per `../risk-assessment-policy.md`'s acceptance criteria, not an oversight, and it
  is bounded by the ongoing due-diligence and DPA controls in `../vendor-and-subprocessor-management.md`.
- Backup restore testing is scored below the high-priority threshold because backups themselves
  are already running reliably (**Have** in `../iso-27001-27701-readiness.md`); the gap is
  verification, not existence, of the recovery capability.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns this treatment plan, approves the acceptance
  decision on sub-processor dependency, and is accountable for the planned actions against the
  mitigated risks.

## Review Cadence

Reviewed **annually** alongside the full risk assessment, and whenever a treated risk's
likelihood, impact, or treatment status changes — consistent with the quarterly register-currency
check in `../risk-assessment-policy.md`. Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.
