# ISO/IEC 27001 + ISO/IEC 27701 Readiness

## Purpose

Give a practical, current-state view of GymFlyte's controls against the ISO/IEC 27001:2022
Annex A control set, the ISO/IEC 27701:2019 privacy-extension requirements, and the GDPR/UAE PDPL
obligations most relevant to certification, so that gaps are visible and prioritized rather than
assumed away by the policy documents alone.

## Scope

Covers the same systems as `information-security-policy.md`: the Laravel API, the Next.js
application, PostgreSQL, DigitalOcean Spaces, the Kubernetes cluster, and the sub-processors in
`vendor-and-subprocessor-management.md`. The full control-by-control detail behind this checklist
lives in `iso27001/statement-of-applicability.md`; this file is the condensed, at-a-glance view.

## Policy Statements

### Current-state checklist

| Annex A / ISO 27701 control | Control area | State | Notes |
|---|---|---|---|
| A.5.1 Policies for Information Security | Documented policy pack (this folder), assigned ownership | **Have** | Policies adopted with an assigned owner (Founder & CTO, UBQ Solutions FZ-LLC) across the pack |
| A.5.2 Information Security Roles and Responsibilities | Policies cross-referenced and indexed (`00-README.md`) | **Have** | Internal only — no external control-environment communication process yet |
| Clause 6.1 Risk Assessment and Treatment | Annual + event-triggered risk assessment, risk register | **Partial** | Process defined in `risk-assessment-policy.md`; register not yet populated with a first full pass |
| A.8.16 Monitoring Activities | Ongoing control monitoring, error/performance alerting | **Gap** | No error-monitoring/alerting tool (e.g. Sentry, uptime monitor) wired in yet — incidents are currently detected via audit-log review or user report |
| A.5.15 Access Control | RBAC, least-privilege, per-branch scoped roles | **Have** | Backend role/permission system, `access-control-policy.md` |
| A.8.5 Secure Authentication | Login rate-limiting | **Have** | Laravel Sanctum session auth with rate-limiting on login attempts |
| A.8.15 Logging | Audit logging of security-relevant events | **Have** | `ActivityLog` |
| A.8.5 Secure Authentication | MFA on admin/owner accounts | **Gap** | Not yet enforced in the product; tracked in `access-control-policy.md` |
| A.8.24 Use of Cryptography | Encryption in transit | **Have** | TLS via cert-manager on the cluster ingress; plaintext HTTP not accepted in production |
| A.5.18 Access Rights | Access provisioning/deprovisioning process | **Partial** | Process defined in `access-control-policy.md`; not yet formally ticketed/tracked end to end |
| A.8.13 Information Backup | Backup schedule (managed PostgreSQL) | **Have** | DigitalOcean managed-database automated backups |
| A.5.30 ICT Readiness for Business Continuity | Backup restore verified | **Partial** | Backups run automatically; restore-to-scratch-environment testing not yet on a fixed schedule — see `business-continuity-and-dr.md` |
| A.8.14 Redundancy of Information Processing Facilities | High availability / redundancy | **Gap** | Cluster runs on a single node, no multi-node failover — documented, accepted risk with remediation plan in `business-continuity-and-dr.md` |
| A.8.32 Change Management | Version control, mandatory code review | **Have** | Git + required PR review, `change-management-policy.md` |
| A.8.29 Security Testing in Development and Acceptance | CI test gates | **Have (dormant)** | GitHub Actions test workflows exist for both repos; not yet the enforced merge gate until Actions minutes are enabled on the org account |
| A.8.32 Change Management | Zero-downtime deploy / rollback | **Have** | Rolling deploy strategy on DO Kubernetes, standalone Next.js build for clean SIGTERM |
| A.5.19 Supplier Relationships | Sub-processor due diligence process | **Have** | `vendor-and-subprocessor-management.md` |
| A.5.22 Monitoring, Review of Supplier Services | Formal, recurring vendor security reviews | **Partial** | Initial due-diligence process defined; recurring (quarterly) re-review not yet operating on a tracked cadence |
| ISO 27701 8.5 (PII processor sub-processor obligations) | DPA + current sub-processor list | **Have** | `vendor-and-subprocessor-management.md` |
| ISO 27701 7.2 (Consent and choice) | Consent records (incl. special-category/sensitive health data) | **Have** | Explicit health-data consent (member `health_consent_at`) + membership terms-acceptance records (method, timestamp, optional e-signature) across all enrolment paths; shipped 2026-08-23 (pending the migrations being run in production) |
| A.5.24–A.5.27 / ISO 27701 7.5 (Breach notification) | Breach-notification process | **Have** | `incident-response-plan.md`, 72-hour authority notification path defined (GDPR + UAE Data Office) |
| ISO 27701 7.3 (Rights of PII principals) | DSAR handling process | **Have** | Self-service member portal export/erasure plus documented timelines in `data-protection-and-gdpr-policy.md` |
| Payments | No card data stored | **Have** | Stripe handles all card data; GymFlyte never touches PAN/CVV |

### Top gaps to close first

1. **MFA on admin/owner accounts (A.8.5)** — highest-leverage single control missing; directly
   protects the accounts with the most damage potential if compromised.
2. **Error monitoring / alerting (A.8.16)** — materially speeds up incident detection (currently
   reactive, via logs/user reports rather than proactive alerting).
3. **High availability (A.8.14)** — the single-node cluster is the largest availability risk in
   the architecture; even a documented interim mitigation (alerting on node resource pressure)
   closes part of the gap cheaply while the multi-node migration is planned.
4. **Enable the CI test gate (A.8.29)** — the workflows already exist; enabling Actions minutes
   converts an already-built control from dormant to enforced with no further engineering work.
5. **Verified backup restore testing (A.5.30)** — a scheduled restore drill turns an assumed
   RPO/RTO into a validated one.

## From this checklist to certification

This checklist is the practical control-implementation view; it is **not** the Statement of
Applicability itself (that lives in `iso27001/statement-of-applicability.md` and covers all 93
Annex A controls, not just the notable ones above) and it is not a certification. The path from
here to an ISO/IEC 27001 certificate:

1. Close the gaps above (or document them as accepted risks per `risk-assessment-policy.md` and
   `iso27001/risk-treatment-plan.md`).
2. Operate the ISMS clauses that are still only partially formalized — see
   `iso27001/iso27001-clauses-4-10.md` for the internal-audit and management-review gaps under
   Clause 9.
3. Engage an **accredited certification body** for the Stage 1 (documentation review) and Stage 2
   (implementation audit) — see `iso27001/00-README.md` for what that process involves. Certified
   organizations undergo annual surveillance audits and a full recertification every 3 years.

Don't promise customers a certification date until a certification body has actually scoped the
engagement.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns this checklist, keeps it current as
  controls move from Gap → Partial → Have.
- **Founder & CTO, UBQ Solutions FZ-LLC**: owns closing the monitoring (A.8.16), MFA (A.8.5), and
  high-availability (A.8.14) gaps listed above.

## Review Cadence

Reviewed **quarterly** — states change faster than the underlying policies do, so this
checklist is refreshed more often than the annual policy review cycle. Owned by
**Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Annex A (all four themes — see `iso27001/statement-of-applicability.md` for the
full 93-control mapping) plus ISO/IEC 27701 privacy clauses and GDPR/PDPL-specific items.
