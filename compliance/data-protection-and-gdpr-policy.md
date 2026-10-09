# Data Protection and GDPR Policy

## Purpose

Define how GymFlyte, operated by UBQ Solutions FZ-LLC, meets its obligations under the EU/UK
GDPR and the UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021, "PDPL") with
respect to personal data processed through the platform, including the split between GymFlyte's
own roles as controller and processor, lawful bases for processing, data-subject rights handling,
and cross-border transfer safeguards. Where GDPR and PDPL requirements diverge, this policy
applies the stricter of the two.

## Scope

Covers all personal data processed by GymFlyte: tenant company account and billing data, member
records (including special-category health data recorded by trainers), staff/user accounts, and
data shared with sub-processors (Stripe, DigitalOcean, the email provider).

## Policy Statements

### GDPR / PDPL roles

The UAE PDPL uses the same functional split as the GDPR — "Controller" and "Processor" are
defined terms under PDPL Art. 1 with materially equivalent obligations to GDPR Arts. 4/24–28 — so
GymFlyte applies one role analysis to both frameworks rather than two parallel ones.

- **GymFlyte as processor**: for member data entered by a tenant gym (names, contact details,
  attendance, membership status, and any health/medical notes trainers record) GymFlyte acts as a
  **processor**, and the tenant gym is the **controller**. GymFlyte processes this data only on
  the tenant's instructions, as expressed through the product's functionality and the
  controller-processor terms in the customer agreement.
- **GymFlyte as controller**: for tenant company account data (owner/staff account details,
  authentication data, billing and subscription records, platform usage/audit data) GymFlyte acts
  as a **controller** in its own right, since this data is collected and used for GymFlyte's own
  business purposes (account administration, billing, platform security).
- Both roles are documented in the customer-facing Data Processing Agreement (DPA), which governs
  the processor relationship for member data.

### Lawful bases

- **Processor-role data (member data)**: the lawful basis is set by the controller (tenant gym);
  GymFlyte's product supports **consent** and **contract necessity** as the bases tenants
  typically rely on for standard membership data. These map to PDPL Art. 4's equivalent
  processing conditions (consent, and processing necessary for contract performance).
- **Controller-role data (account/billing)**: processed under **contract necessity** (providing
  the service the tenant signed up for) and **legitimate interest** (platform security, fraud
  prevention, service improvement), with **legal obligation** as the basis for retained financial
  records (see `data-retention-and-disposal-policy.md`) — consistent with PDPL Art. 4's contract,
  legitimate-interest, and legal-obligation conditions.
- **Special-category health data**: member health/injury/medical notes are special-category data
  under GDPR Art. 9, and "Sensitive Personal Data" under PDPL Art. 1/Art. 5 (both frameworks
  single out health data for a heightened basis). Processing requires **explicit consent from the
  data subject (GDPR Art. 9(2)(a); PDPL Art. 5)**, captured before a trainer records such data
  against a member's profile. Where explicit consent cannot be obtained and processing is
  necessary to protect the vital interests of the data subject or another person and the subject
  is physically or legally incapable of giving consent (GDPR Art. 9(2)(c); PDPL Art. 5's
  equivalent vital-interest exception) — for example, an emergency medical note recorded during an
  incident — that basis applies as a fallback, and is flagged as such in the record.

### Consent records

- Explicit consent for special-category data is captured and stored as an auditable record: who
  consented, what was consented to, and when, tied to the member profile.
- Consent can be withdrawn by the data subject at any time; withdrawal is recorded and stops
  future processing of the relevant data on that basis (existing lawfully-processed data is
  handled per the retention/erasure rules in `data-retention-and-disposal-policy.md`, not
  automatically deleted on withdrawal alone).
- Legal-acceptance records (terms, privacy policy, consent capture at signup) are retained as
  evidence of the lawful basis relied upon.

### Data subject rights & DSAR handling

- Data subjects (members, staff, tenant account holders) may exercise: right of access,
  rectification, erasure, restriction of processing, data portability, and objection, under
  GDPR Arts. 15–21, and the equivalent rights (access, correction, erasure, restriction,
  objection, data portability) under PDPL Chapter 4.
- Requests are logged on receipt and responded to **within one month** of receipt, extendable by a
  further **two months** for complex requests (with the data subject informed of the extension
  and reason within the first month), per GDPR Art. 12(3). GymFlyte applies this same timeline to
  PDPL requests as the operative internal standard, satisfying PDPL's own "without undue delay"
  requirement.
- Requests concerning member data (processor role) are routed to the relevant tenant controller
  where GymFlyte is acting purely as processor; GymFlyte directly supports self-service access,
  export, and erasure for member and account data through the product (member portal self-service
  export/erasure, `MemberEraser` for anonymized erasure preserving required financial records).
- Identity of the requester is verified before fulfilling a request involving personal data.

### DPIA triggers

A Data Protection Impact Assessment is conducted before introducing any of the following:

- Large-scale processing of special-category (health) data beyond current scope.
- A new sub-processor or infrastructure change involving cross-border transfer of personal data.
- Systematic monitoring or profiling of data subjects at scale.
- Any new feature identified during design review as high-risk to data-subject rights.

DPIA outcomes feed the risk register in `risk-assessment-policy.md`.

### Cross-border transfers

- GymFlyte's infrastructure (DigitalOcean) and sub-processors (Stripe, email provider) may involve
  processing outside the EEA/UK and outside the UAE. Where a sub-processor processes personal data
  outside an adequacy-recognized jurisdiction, transfers are covered by **Standard Contractual
  Clauses (SCCs)** incorporated into that sub-processor's DPA, consistent with
  `vendor-and-subprocessor-management.md`. The same contractual safeguard is treated as meeting
  PDPL Arts. 22–23's cross-border transfer conditions (adequate-level-of-protection assessment or
  appropriate contractual safeguards), since GymFlyte itself is UAE-domiciled and most of its
  sub-processors' infrastructure sits outside the UAE.
- The current sub-processor list and their transfer safeguards are maintained in
  `vendor-and-subprocessor-management.md` and disclosed to tenant controllers as required by the
  processor relationship.

### Breach notification

- Personal-data breaches are handled per `incident-response-plan.md`. Where a breach is likely to
  result in a risk to individuals, the relevant supervisory authority and the UAE Data Office are
  notified **within 72 hours** of GymFlyte becoming aware (GDPR Art. 33; PDPL's equivalent
  without-undue-delay notification duty to the UAE Data Office is met by applying the same 72-hour
  internal standard); affected data subjects are notified without undue delay where the risk is
  high (GDPR Art. 34; PDPL's equivalent data-subject notification duty).
- For member data where GymFlyte is processor, affected tenant controllers are notified promptly
  so they can meet their own downstream Art. 33/34 obligations to their members.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns this policy, DSAR handling, DPIA decisions, and
  breach-notification judgment calls.
- **Tenant Owners** (in-app, as controllers of their member data): responsible for the lawful
  basis and accuracy of the member data they record, including special-category health notes.
- **All engineers**: responsible for flagging features that touch personal data in a new way for
  DPIA review before shipping.

## Review Cadence

Reviewed **annually** or upon a material change to processing activities, sub-processors, or
applicable law. Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Annex A A.5.34 (Privacy and Protection of PII) / ISO/IEC 27701 Clauses 7 & 8 (PIMS —
PII Controller and PII Processor obligations); see `iso27001/iso27701-mapping.md`.
