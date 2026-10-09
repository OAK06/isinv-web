# ISO/IEC 27701:2019 Mapping — Privacy Information Management System

## Purpose

ISO/IEC 27701 is the **privacy extension to ISO/IEC 27001**: it does not stand alone, but adds a
Privacy Information Management System (PIMS) layer on top of an existing ISMS, extending Clauses
4–10 and Annex A with privacy-specific guidance and a set of additional controls for
organizations acting as a **PII Controller** and/or a **PII Processor**. This document maps that
extension onto GymFlyte's ISMS (`isms-scope.md`, `iso27001-clauses-4-10.md`,
`statement-of-applicability.md`) and onto the GDPR + UAE PDPL obligations already documented in
`../data-protection-and-gdpr-policy.md`, rather than restating either.

## Scope

Applies wherever GymFlyte processes personal data as either a PII controller (tenant account and
billing data) or a PII processor (member data recorded by a tenant gym) — the same controller/
processor split defined in `../data-protection-and-gdpr-policy.md` "GDPR / PDPL roles".

## How ISO 27701 extends the ISMS

- It reuses the Clause 4–10 management-system structure from ISO/IEC 27001 as-is — GymFlyte's
  existing ISMS scope, leadership, planning, support, operation, performance evaluation, and
  improvement processes (`iso27001-clauses-4-10.md`) apply unchanged; ISO 27701 does not require a
  second, parallel management system.
- It adds **PIMS-specific guidance** to the existing Annex A controls in
  `statement-of-applicability.md` (e.g. access control, incident management, and supplier
  management controls each get a privacy-specific reading), rather than introducing a wholly
  separate control set.
- It adds **two new control clauses specific to the PII role held**:
  - **Clause 7** — additional controls for organizations acting as a **PII Controller**.
  - **Clause 8** — additional controls for organizations acting as a **PII Processor**.

GymFlyte holds both roles (see `../data-protection-and-gdpr-policy.md`), so both clauses apply.

## Clause 7 — PII Controller obligations (GymFlyte's controller-role data: tenant account,
billing, authentication, and platform-audit data)

| ISO 27701 area | Requirement | GymFlyte implementation | State |
|---|---|---|---|
| 7.2 Conditions for collection and processing | Identify and document a lawful basis for each processing purpose; obtain and record consent where relied upon | `../data-protection-and-gdpr-policy.md` "Lawful bases", "Consent records" — contract necessity, legitimate interest, legal obligation, and explicit consent for special-category data, each with a documented basis under GDPR and PDPL | **Have** |
| 7.3 Obligations to PII principals | Provide privacy notices; support access, rectification, erasure, restriction, portability, and objection rights | `../data-protection-and-gdpr-policy.md` "Data subject rights & DSAR handling"; self-service member portal export/erasure, `MemberEraser` | **Have** |
| 7.4 Privacy by design and by default | Assess privacy impact before introducing new processing; minimize data collected and retained | `../data-protection-and-gdpr-policy.md` "DPIA triggers"; `../data-retention-and-disposal-policy.md` category-based retention windows | **Have** |
| 7.5 PII sharing, transfer, and disclosure | Govern disclosure to processors/sub-processors and cross-border transfer | `../data-protection-and-gdpr-policy.md` "Cross-border transfers"; `../vendor-and-subprocessor-management.md` DPA/SCC requirements | **Have** |

## Clause 8 — PII Processor obligations (GymFlyte's processor-role data: member records entered by
a tenant gym, including special-category health data)

| ISO 27701 area | Requirement | GymFlyte implementation | State |
|---|---|---|---|
| 8.2 Conditions for collection and processing | Process only on the controller's (tenant gym's) documented instructions; support the controller's own obligations to its data subjects | `../data-protection-and-gdpr-policy.md` "GymFlyte as processor" — processing limited to the tenant's instructions as expressed through product functionality and the customer DPA | **Have** |
| 8.3 Obligations to PII principals | Assist the controller in responding to data-subject requests it cannot fulfil directly | `../data-protection-and-gdpr-policy.md` "Data subject rights & DSAR handling" — member-data requests routed to the relevant tenant controller where GymFlyte acts purely as processor | **Have** |
| 8.4 Privacy by design and by default | Limit processing to the purpose instructed by the controller; support data minimization the controller configures | Product functionality is scoped to gym-configured fields and features; special-category health data capture is opt-in per tenant | **Have** |
| 8.5 PII sharing, transfer, and disclosure | Notify the controller of sub-processor engagement and any legally-required disclosure; support the controller's cross-border transfer obligations | `../vendor-and-subprocessor-management.md` "Ongoing monitoring & change notification" — advance notice to tenants for material sub-processor additions | **Have** |

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns this mapping, ensures Clause 7 and Clause 8
  controls stay aligned with `../data-protection-and-gdpr-policy.md` as that policy evolves, and
  is accountable for closing any control gap identified above.
- **All engineers**: responsible for flagging features that shift GymFlyte's controller/processor
  role for a given data category, per the DPIA-trigger process in
  `../data-protection-and-gdpr-policy.md`.

## Review Cadence

Reviewed **annually**, or whenever `../data-protection-and-gdpr-policy.md`, the ISMS scope, or the
GDPR/PDPL obligations underlying it change materially. Owned by
**Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27701:2019 Clauses 7 & 8 (PIMS — PII Controller and PII Processor obligations), extending
ISO/IEC 27001 Annex A A.5.34 (Privacy and Protection of PII).
