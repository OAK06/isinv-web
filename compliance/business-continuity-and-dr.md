# Business Continuity and Disaster Recovery Policy

## Purpose

Define how GymFlyte maintains and recovers service availability in the event of infrastructure
failure, data loss, or a major outage, and honestly document current gaps in that capability.

## Scope

Covers the PostgreSQL database (DigitalOcean managed), DigitalOcean Spaces object storage, and
the DigitalOcean Kubernetes cluster hosting both the Laravel API and the Next.js application.

## Policy Statements

### Backups

- The production PostgreSQL database is backed up **daily** via DigitalOcean's
  managed-database backup feature, retained for **30 days**.
- Object storage (Spaces) durability is inherited from DigitalOcean's platform-level redundancy;
  application-level data (file references) is backed up as part of the database backup.
- Backup **restore testing** is currently **Ad hoc — not yet on a fixed schedule**. Target:
  a scheduled restore-to-scratch-environment test **quarterly**, with results logged.

### Recovery objectives

- **RPO (Recovery Point Objective): 24 hours** — maximum acceptable data loss,
  bounded by backup frequency above.
- **RTO (Recovery Time Objective): 24 hours** — maximum acceptable time to restore
  service after a declared disaster.
- These are targets, not yet validated by a real recovery drill — validate via the restore
  testing above before quoting them externally.

### Known gap: single-node cluster, no HA

- **Current state**: the DigitalOcean Kubernetes cluster runs on a **single node** with no
  high-availability node pool and no automated multi-node failover. This is a known,
  deliberately-accepted-for-now risk (see root `CLAUDE.md` cluster topology notes), not an
  oversight.
- **Risk**: a node failure or resource exhaustion event causes a full outage of both the API and
  the frontend simultaneously, for all tenants, until the node is recovered or replaced.
- **Remediation plan**: Founder & CTO, UBQ Solutions FZ-LLC to evaluate moving to a multi-node pool with pod anti-affinity
  once load/budget justifies it; interim mitigation is active node resource monitoring
  (`kubectl top nodes`) and prompt node upsizing when utilization is tight. Target date for HA
  evaluation: **Not yet performed**.
- This gap is called out explicitly here — and in `iso-27001-27701-readiness.md` — rather than
  glossed over, because it is the single biggest availability risk in the current architecture.

### Continuity

- In a prolonged outage, member-facing check-in and billing are the highest-priority functions to
  restore first, per **Database → API / web application → object storage → background workers**.
- Deploys use a standalone Next.js build (`node server.js` as PID1) specifically so rolling
  deploys get a clean SIGTERM — this reduces (but does not eliminate) deploy-related downtime.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns backup configuration, restore testing
  schedule, and the HA remediation roadmap.
- **Incident Commander** (per `incident-response-plan.md`): declares a disaster and triggers
  recovery procedures.

## Review Cadence

Reviewed **annually** and after any incident that tests recovery capability. Restore test
results logged **quarterly**. Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Annex A A.5.29 (Information Security During Disruption), A.5.30 (ICT Readiness for
Business Continuity), A.8.13 (Information Backup), A.8.14 (Redundancy of Information Processing
Facilities).
