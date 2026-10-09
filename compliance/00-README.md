# GymFlyte Compliance Policy Pack

## What this is

This folder is the internal policy layer for **GymFlyte**, operated by **UBQ Solutions FZ-LLC**
(Ras Al Khaimah, United Arab Emirates). These are **internal governance documents** — not customer-facing pages,
not marketing collateral, not legal contracts. They set out how the organisation runs
security, privacy, and operations, and the controls staff are expected to follow.

## How to use this pack

1. Placeholder values (policy owner, review cadences, and targets such as backup RPO/RTO) are
   filled with sensible defaults for a company this size. Review them against how you actually
   operate and adjust any that differ.
2. Each policy has a **Review cadence** section — put it on a calendar. A policy nobody re-reads
   is a policy that quietly goes stale.
3. Policies reference each other (e.g. Incident Response references Data Protection's breach
   definitions). Keep changes consistent across files when you edit one.
4. This pack describes *intent*. ISO/IEC 27001 and ISAE 3402 auditors, and GDPR/PDPL regulators,
   care about *evidence* that the intent was actually followed — see the readiness note below.

## Files in this pack

| File | Covers |
|---|---|
| `information-security-policy.md` | Top-level security program, ownership, acceptable use |
| `access-control-policy.md` | Least privilege, RBAC, MFA, provisioning/deprovisioning, passwords |
| `incident-response-plan.md` | Severity levels, roles, response steps, breach notification |
| `data-retention-and-disposal-policy.md` | Data categories, retention windows, deletion, backups |
| `business-continuity-and-dr.md` | Backups, RPO/RTO, restore testing, the no-HA gap |
| `vendor-and-subprocessor-management.md` | Vendor due diligence, DPAs, current sub-processor list |
| `change-management-policy.md` | Version control, review, CI gates, deploy, rollback |
| `risk-assessment-policy.md` | Annual/triggered risk assessments, risk register |
| `data-protection-and-gdpr-policy.md` | Controller/processor roles, lawful bases, DSARs, DPIAs — GDPR + UAE PDPL |
| `iso-27001-27701-readiness.md` | Current-state checklist against ISO/IEC 27001 Annex A + ISO/IEC 27701 + GDPR/PDPL |
| `iso27001/` | Full ISMS documentation (scope, clauses 4–10, Statement of Applicability, risk treatment, ISO 27701 mapping) |
| `isae3402/` | ISAE 3402 control-objectives groundwork for customers whose financial reporting relies on GymFlyte |

## Assurance readiness note

International assurance for a SaaS platform like GymFlyte rests on three complementary
frameworks, none of which is a self-issued claim:

- **ISO/IEC 27001** (Information Security Management System) — a **certifiable** management-system
  standard, audited and certified by an accredited certification body via a two-stage process
  (Stage 1 documentation review, Stage 2 implementation audit), resulting in a certificate valid
  for a 3-year cycle with annual surveillance audits. See `iso27001/00-README.md`.
- **ISO/IEC 27701** (Privacy Information Management System) — the privacy extension to ISO 27001,
  mapping the ISMS to GDPR/PDPL controller and processor obligations. See
  `iso27001/iso27701-mapping.md`.
- **ISAE 3402** (International Standard on Assurance Engagements 3402) — an independent CPA/audit
  firm's assurance report on controls at a service organization relevant to a *user entity's*
  financial reporting (the international equivalent of SOC 1), issued as Type 1 (point-in-time) or
  Type 2 (operating-effectiveness over an observation window). See `isae3402/00-README.md`.

This pack is the **policy layer only**. Getting from here to an actual ISO 27001 certificate and/or
an ISAE 3402 report requires, roughly, in order:

1. **Implement the controls** the policies describe (MFA enforcement, monitoring/alerting,
   verified backup restores, documented onboarding/offboarding, etc.) — see
   `iso-27001-27701-readiness.md` for what's already in place vs. still a gap.
2. **Collect evidence** continuously (access logs, ticket trails, review sign-offs) — a policy
   with no evidence trail is invisible to an auditor.
3. **Run a readiness assessment / gap analysis**, ideally with a firm or tool that specializes in
   this (e.g. Vanta, Drata, or a boutique compliance consultancy) — these tools automate a lot of
   the evidence collection above and are the pragmatic path for a small team.
4. **Engage an accredited certification body** for the ISO 27001 Stage 1/Stage 2 audit, and/or a
   licensed audit firm for the ISAE 3402 Type 1 and then Type 2 engagement.

Realistic timeline for a company this size: several months of control implementation, then the
ISO 27001 Stage 1/Stage 2 audit cycle and/or a 6–12 month ISAE 3402 Type 2 observation window.
Don't promise customers a certification or report date until step 3 has produced a real gap
analysis.

## Ownership and governance

These policies are owned and maintained by **Founder & CTO, UBQ Solutions FZ-LLC**,
who is responsible for keeping them current, ensuring the controls they describe are implemented,
and approving changes. Claims of external certification (for example "ISO 27001 certified" or
"ISAE 3402 Type 2") must not be made until the corresponding audit/certification has been
completed.

## Review cadence

This index should be reviewed whenever a policy is added, removed, or renamed, and at minimum
**annually**, owned by **Founder & CTO, UBQ Solutions FZ-LLC**.
