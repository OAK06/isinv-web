# Vendor and Sub-processor Management Policy

## Purpose

Define how GymFlyte evaluates, contracts with, and monitors third parties (vendors and
sub-processors) that touch GymFlyte or tenant data, so that risk introduced by third parties is
understood and controlled.

## Scope

Covers any third party that stores, processes, or transmits GymFlyte or tenant/member data,
including infrastructure providers, payment processors, and communication providers.

## Policy Statements

### Due diligence (new vendor)

- Before onboarding a new vendor with access to production data, evaluate: what data they will
  touch, their security posture (published certifications, security page, or a completed
  questionnaire), their sub-processors (do they have their own?), and contractual terms
  (DPA availability, breach-notification obligations, data-location commitments).
- Vendors handling personal data require a signed **Data Processing Agreement (DPA)**, including
  Standard Contractual Clauses (SCCs) where the vendor processes data outside the
  EEA/UK/adequacy-recognized jurisdictions, before go-live.
- Vendor risk is documented in **this `compliance/` folder**, cross-referenced with
  `risk-assessment-policy.md`.

### Current sub-processor list

| Sub-processor | Purpose | Data involved | DPA status |
|---|---|---|---|
| **Stripe** | Payment processing (platform billing + member payments via gym-owned Stripe keys) | Payment/billing metadata; no card data touches GymFlyte servers | In force — Stripe standard DPA (incorporated under Stripe's terms) |
| **DigitalOcean** | Managed PostgreSQL, Kubernetes hosting, Spaces object storage | All tenant/member data, at rest and in transit | DigitalOcean DPA with SCCs — execute and retain a copy |
| **SMTP2GO** | Transactional email (notifications, password reset, invoices) | Member/staff email addresses, transactional content | Provider DPA with SCCs — execute and retain a copy |

This table must stay current — see `data-protection-and-gdpr-policy.md` for the tenant-facing
sub-processor disclosure obligation this feeds.

### Ongoing monitoring & change notification

- Sub-processor list is reviewed **quarterly** for accuracy and re-evaluated whenever a new
  sub-processor is added or an existing one changes its terms materially.
- Adding a new sub-processor that will touch tenant/member data triggers: (1) update to this
  table, (2) update to any customer-facing sub-processor disclosure, (3) for material additions,
  advance notice to tenants per the notice period committed in customer terms
  **30 days**.
- Vendor security incidents affecting GymFlyte data are handled through
  `incident-response-plan.md`, treating the vendor's breach as GymFlyte's own for notification
  purposes.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns vendor onboarding review and
  the sub-processor list.
- **Founder & CTO, UBQ Solutions FZ-LLC**: owns DPA/SCC review and tenant notification for sub-processor
  changes.

## Review Cadence

Sub-processor list reviewed **quarterly**; full policy reviewed **annually**. Owned by
**Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Annex A A.5.19–A.5.22 (Information Security in Supplier Relationships, Addressing
Security within Supplier Agreements, ICT Supply Chain, Monitoring and Review of Supplier Services)
/ ISO/IEC 27701 Clause 8.5 (PII processor's sub-processor obligations).
