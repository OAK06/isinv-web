# Incident Response Plan

## Purpose

Define how GymFlyte detects, contains, communicates, and learns from security incidents and data
breaches, including regulatory breach-notification obligations under GDPR.

## Scope

Covers any suspected or confirmed security incident affecting the Laravel API, Next.js app,
PostgreSQL database, DigitalOcean Spaces, the Kubernetes cluster, or any sub-processor holding
GymFlyte data.

## Policy Statements

### Severity levels

| Level | Definition | Example |
|---|---|---|
| **SEV1 — Critical** | Confirmed data breach, active exploitation, or full platform outage | Unauthorized DB access; ransomware; cluster down for all tenants |
| **SEV2 — High** | Suspected breach or significant single-tenant impact | Auth bypass suspected; one tenant's data exposed |
| **SEV3 — Medium** | Contained issue, no confirmed data exposure | Vulnerable dependency identified pre-exploitation |
| **SEV4 — Low** | Minor, no customer impact | Internal tooling misconfiguration |

### Response steps

1. **Detect** — via monitoring/alerting Gap — see `iso-27001-27701-readiness.md`, audit log
   review (`ActivityLog`), user report, or sub-processor notification.
2. **Triage** — Incident Commander assigns severity within **1 hour** of detection.
3. **Contain** — isolate affected systems/credentials (rotate keys, revoke sessions, scale down
   affected pods) without destroying forensic evidence.
4. **Eradicate & recover** — remove root cause, restore from known-good state/backups per
   `business-continuity-and-dr.md`.
5. **Notify** — per the breach-notification timelines below.
6. **Post-mortem** — blameless written post-mortem within **5 business days** of resolution:
   timeline, root cause, remediation items with owners and due dates.

### Breach notification

- **GDPR**: where a personal-data breach is likely to result in a risk to individuals, the
  Incident Commander/DPO notifies the relevant supervisory authority **within 72 hours** of
  becoming aware of the breach (Art. 33). Affected data subjects are notified without undue delay
  where the breach is likely to result in a **high** risk to their rights and freedoms (Art. 34).
- Affected tenant companies (as data controllers for their member data — see
  `data-protection-and-gdpr-policy.md`) are notified promptly so they can meet their own
  downstream obligations to their members.
- Notification content includes: nature of the breach, categories/approx. number of data subjects
  and records affected, likely consequences, and measures taken/proposed.
- Sub-processor breaches (Stripe, DigitalOcean, email provider) are tracked and, where they
  affect GymFlyte data, trigger this same process — see `vendor-and-subprocessor-management.md`.

## Roles & Responsibilities

- **Incident Commander (Founder & CTO, UBQ Solutions FZ-LLC)**: owns triage, coordination, and sign-off on
  resolution.
- **Founder & CTO, UBQ Solutions FZ-LLC**: owns GDPR notification decisions and regulator/data-subject
  communication.
- **On-call engineer(s)**: first responders for detection and containment.
- **Founder & CTO, UBQ Solutions FZ-LLC**: owns external/customer communication during a SEV1/SEV2.

## Review Cadence

Plan reviewed **annually** and after every SEV1/SEV2 incident (as part of the post-mortem).
Tabletop exercise **annually**. Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Annex A A.5.24–A.5.27 (Incident Management Planning, Assessment, Response,
Learning) / ISO/IEC 27701 Clause 7.5 (breach and incident notification).
