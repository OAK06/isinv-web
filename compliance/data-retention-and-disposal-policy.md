# Data Retention and Disposal Policy

## Purpose

Define how long GymFlyte retains different categories of data, and how that data is securely
deleted or anonymized once it is no longer needed.

## Scope

Covers data in the PostgreSQL production database, DigitalOcean Spaces object storage, database
backups, and application logs (including `ActivityLog` audit records).

## Policy Statements

### Data categories & retention windows

| Category | Examples | Retention |
|---|---|---|
| Account/member core data | Name, contact info, membership status | Life of tenant account + 30 days post-deletion grace period |
| **Special-category (health) data** | Member health notes, injury/medical fields used by trainers | Life of member record; deleted/anonymized on member erasure request, minimum retention beyond active use only where Accounting and tax law applies |
| Financial/billing records | Invoices, subscription history (no card data — see below) | 7 years to meet UAE and international accounting record-keeping norms — confirm with finance/legal |
| Payment data | N/A — GymFlyte does not store card data; handled entirely by Stripe | N/A |
| Audit logs (`ActivityLog`) | Login events, permission changes, record edits | 12 months rolling |
| Application/error logs | Request logs, exception traces | 30–90 days rolling |
| Database backups | Full/incremental PostgreSQL backups | 30 days rolling, per `business-continuity-and-dr.md` |
| Object storage files | Member photos, uploaded documents | Life of associated record; deleted on record/member deletion |

### Disposal

- Deletion at the application layer is followed by removal from backups on their normal rotation
  schedule (backups are not indefinitely retained past the window above).
- Object storage files are deleted from DigitalOcean Spaces, not merely unlinked from the
  database record.
- **GDPR right to erasure**: member erasure requests are handled per
  `data-protection-and-gdpr-policy.md` — financial records tied to a member are anonymized
  (identifying fields stripped) rather than hard-deleted where retention is legally required for
  accounting purposes, consistent with GDPR Art. 17(3)(b).
- Decommissioned infrastructure (old cluster nodes, deprovisioned storage) is wiped or destroyed
  per the hosting provider's (DigitalOcean) data-sanitization practices before reuse/release.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns retention window configuration (scheduled deletion
  jobs, log rotation policy) in the application and infrastructure.
- **Founder & CTO, UBQ Solutions FZ-LLC**: owns erasure-request handling and special-category data
  retention judgment calls.
- **Tenant Owners** (in-app): responsible for the accuracy and lawful basis of the health/medical
  data they choose to record for their members.

## Review Cadence

Reviewed **annually** or when a new data category is introduced to the product. Owned by
**Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Annex A A.5.33 (Protection of Records), A.7.14 (Secure Disposal or Re-use of
Equipment), A.8.10 (Information Deletion) / ISO/IEC 27701 Clause 7.4.7 (retention, disposal).
