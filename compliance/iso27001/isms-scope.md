# ISMS Scope Statement

## Purpose

Define the boundary of GymFlyte's Information Security Management System (ISMS) under
ISO/IEC 27001:2022 — what is in scope, who has a stake in it, and what is deliberately excluded
and why — so that the scope of certification is unambiguous to internal staff and to an external
certification body.

## Organizational boundary

The ISMS is operated by **UBQ Solutions FZ-LLC**, a company registered in Ras Al Khaimah, United Arab Emirates, for its **GymFlyte** product: a multi-tenant SaaS platform for gym and fitness-club
management (member management, class scheduling, point-of-sale/sales, inventory, staff and
roles/permissions, subscriptions and plans, branches, QR check-in/scanner, referrals, and
reporting).

There is a single legal entity and a single product in scope — the ISMS does not need to account
for multiple business units, brands, or subsidiaries.

## In-scope systems, data, and processes

The ISMS covers the same system boundary defined in `../information-security-policy.md`:

- **The Laravel API** (`GymFlyteBack`) — the backend application serving all tenant and member
  data.
- **The Next.js application** (`GymFlyteFront`) — the web application (public marketing site,
  authenticated tenant app, member portal).
- **PostgreSQL** — the production database (DigitalOcean managed), holding all tenant, member,
  staff, billing, and audit data.
- **DigitalOcean Spaces** — object storage for uploaded files (member photos, documents), accessed
  only via short-lived signed URLs.
- **DigitalOcean Kubernetes** — the cluster hosting both applications, namespace `gymflyte`.
- **Stripe** — payment processing (platform billing, and member payments via gym-owned Stripe
  keys); no card data is stored by GymFlyte.
- **SMTP2GO** — transactional email.
- **People and process**: engineering staff and contractors with access to any of the above,
  the software development lifecycle (`../change-management-policy.md`), incident response
  (`../incident-response-plan.md`), access management (`../access-control-policy.md`), and vendor
  management (`../vendor-and-subprocessor-management.md`).

Data types in scope: tenant company account and billing data, member records (including
special-category health data recorded by trainers), staff/user account data, and application/audit
logs — as categorized in `../data-retention-and-disposal-policy.md`.

## Interested parties and their requirements

| Interested party | Requirement / expectation |
|---|---|
| Tenant gyms (customers) | Confidentiality and availability of their business and member data; contractual and DPA commitments honored; breach notification per `../incident-response-plan.md` |
| Gym members (data subjects) | Lawful, transparent processing of their personal and special-category data; ability to exercise GDPR rights per `../data-protection-and-gdpr-policy.md` |
| UBQ Solutions FZ-LLC (the organization) | Sustainable, certifiable security posture that supports enterprise sales and reduces breach/outage risk |
| Regulators (EU/UK supervisory authorities under the GDPR; the UAE Data Office under the UAE Personal Data Protection Law, Federal Decree-Law No. 45 of 2021, "PDPL") | Compliance with breach-notification and data-subject-rights obligations |
| Sub-processors (Stripe, DigitalOcean, SMTP2GO) | Accurate data-processing instructions and DPA compliance from GymFlyte as their customer |
| A future accredited certification body | Evidence that the ISMS is genuinely operated, not just documented |

## Exclusions

- **Physical facilities**: GymFlyte does not operate its own data centers, offices with
  in-scope equipment, or physical server rooms. All physical infrastructure security is inherited
  from DigitalOcean's data centers under their own certifications (see Annex A.7 in
  `statement-of-applicability.md` for how this is applied). UBQ Solutions FZ-LLC's own office
  premises (used for staff work, not for hosting in-scope systems) are outside the certification
  boundary.
- **Tenant-side hardware and networks**: the scanners, POS terminals, and networks operated by
  individual tenant gyms are outside GymFlyte's control and outside this ISMS boundary; GymFlyte's
  responsibility ends at its own application and API surfaces.
- **Non-production environments used only for local development** (a developer's own machine) are
  outside the boundary; the staging/dev environment described in `../change-management-policy.md`
  *is* in scope as it handles a copy of the application stack, isolated secrets, and Stripe
  test-mode data.
- **Card payment data** is explicitly out of scope — GymFlyte never stores, processes, or
  transmits cardholder data; all card handling is delegated to Stripe under its own PCI DSS
  compliance.

## Review Cadence

This scope statement was established **23 August 2026** and is reviewed **annually**, or
whenever the in-scope systems, sub-processors, or organizational boundary change materially.
Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.
