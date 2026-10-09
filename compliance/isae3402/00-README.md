# ISAE 3402 Readiness — GymFlyte

## What this is

This folder is the **ISAE 3402 control groundwork** for GymFlyte, operated by
**UBQ Solutions FZ-LLC** (Ras Al Khaimah, United Arab Emirates). It sits alongside the
`iso27001/`-style material in the parent `compliance/` pack — same internal-governance nature:
not customer-facing pages, not marketing collateral, not legal contracts, and not a completed
assurance report. It documents the control objectives and control activities relevant to
ISAE 3402 so that, when a customer's auditor asks, the answer is a mapped set of real controls
rather than a scramble.

## What ISAE 3402 is

ISAE 3402 (**International Standard on Assurance Engagements 3402**, "Assurance Reports on
Controls at a Service Organization") is issued by the International Auditing and Assurance
Standards Board (IAASB) and is the internationally recognized standard for reporting on controls
at a service organization that are relevant to a **user entity's** internal control over
financial reporting. It is the international equivalent of the US AICPA's SOC 1 framework, and is
the standard applied outside the US/Canada (including in the UAE and across the EU/UK). Unlike a
security-focused framework such as ISO/IEC 27001 — which addresses a service organization's
information security posture broadly — ISAE 3402 reports specifically on controls relevant to a
**user entity's Internal Control over Financial Reporting (ICFR)**. It exists because when a
company outsources part of its financial process to a service provider, that company's own
external auditor still has to form an opinion on the company's financial statements — and needs
assurance that the outsourced piece is controlled.

An ISAE 3402 engagement is performed by an independent **assurance practitioner** — typically a
licensed audit/accountancy firm — who issues the report; a service organization cannot self-issue
one.

### Type 1 vs Type 2

- **Type 1** — a point-in-time opinion: were the described controls suitably designed as of a
  specific date? Faster to obtain, but says nothing about whether the controls actually operated
  reliably over time.
- **Type 2** — an operating-effectiveness opinion: did the described controls operate
  effectively over an observation period (typically 6–12 months), based on the practitioner
  testing a sample of transactions/evidence across that window? This is the report most customer
  auditors actually want to rely on, and the one worth working toward.

Both require an independent assurance practitioner to plan, test, and issue the report — no
internal document, including this one, can substitute for that engagement. This pack is the
control groundwork a service organization puts in place *before* engaging a practitioner; it is
not itself an assurance report, and no claim is made anywhere in this pack that an ISAE 3402
report has been issued for GymFlyte.

### ICFR scope

ICFR is the set of processes designed to give reasonable assurance that a company's financial
statements are reliable — in practice, that revenue, receivables, and expenses are recorded
**completely, accurately, in the right period, and only by authorized parties**. An ISAE 3402
report does not cover a service organization's entire system the way an ISO/IEC 27001 ISMS does;
it is scoped narrowly to the subset of controls that feed into a user entity's financial
statement line items.

## Why ISAE 3402 is relevant to GymFlyte

GymFlyte is not a typical horizontal SaaS tool for its customers — it is effectively the
**financial system of record** for the gyms, studios, and personal trainers that run on it. A
gym customer's revenue recognition, accounts receivable, and cash reconciliation all originate
inside GymFlyte:

- **POS / sales** — every retail and service sale a gym makes runs through GymFlyte's POS
  register flow.
- **Invoicing** — membership dues, POS sales, and other charges are invoiced inside GymFlyte
  (`Invoice` + `InvoiceItem` records), not in a separate accounting system.
- **Payments** — member card charges (recurring membership billing, one-off invoice payments)
  are processed through GymFlyte's Stripe integration, and the resulting payment/receipt records
  live in GymFlyte.
- **Subscriptions** — recurring membership plans (`MemberPlan`, `MemberPlanRenewal`) drive
  scheduled billing and therefore the timing of a gym's revenue.
- **Revenue reporting** — a gym's own bookkeeping, tax filing, or annual audit will, directly or
  through an export, trace back to GymFlyte's transaction records as the underlying source data.

Because of this, a gym customer's external accountant or auditor may need to **rely on
GymFlyte's controls** over the completeness and accuracy of that financial data when forming an
opinion on the gym's own financial statements — exactly the scenario ISAE 3402 exists for. This
is different from most SaaS products (e.g. a scheduling tool or a chat app) where a customer's
auditor would have no reason to look at the vendor's controls at all.

## Relationship to the ISO 27001 / ISO 27701 pack

The packs are not separate control programs — they share a foundation and diverge in emphasis:

- **Shared controls**: the security fundamentals documented in `../information-security-policy.md`,
  `../access-control-policy.md`, `../change-management-policy.md`, and tracked in
  `../iso-27001-27701-readiness.md` (RBAC, audit logging, encryption in transit, change review,
  CI gates, backups) are the same controls that underpin ICFR reliability — a financial record
  that anyone can edit without authorization or audit trail is not a reliable financial record,
  regardless of which report is being discussed.
- **What ISAE 3402 adds**: control objectives specific to financial-reporting assertions —
  completeness and accuracy of transaction recording, authorization of financial-record changes,
  payment processing integrity, segregation of duties, and cutoff/timeliness of billing. These
  are captured in `control-objectives-matrix.md` in this folder, each explicitly pointing back to
  the underlying GymFlyte control (many of which are the same technical controls the ISO 27001
  pack already documents, viewed through a financial-reporting lens rather than a
  general-security lens).
- A gym customer whose auditor asks about GymFlyte's ISO/IEC 27001 certification and a gym
  customer whose auditor asks about ICFR-relevant controls are, in practice, often asking
  overlapping questions — this pack exists so both can be answered from documented, consistent
  material rather than two divergent stories.

## Files in this pack

| File | Covers |
|---|---|
| `00-README.md` | This file — what ISAE 3402 is, why it applies, relationship to ISO 27001 |
| `control-objectives-matrix.md` | Control objectives, control activities, current state (Have/Partial/Gap), reference to the underlying GymFlyte control |
| `complementary-user-entity-controls.md` | Controls the gym (user entity), not GymFlyte, must perform for the numbers to be reliable end to end |

## The honest gap: this is not an assurance report

Nothing in this folder is, or claims to be, an ISAE 3402 report. An ISAE 3402 report — Type 1 or
Type 2 — requires engaging an independent assurance practitioner, who independently designs a
test plan, requests evidence, and forms their own opinion; a service organization cannot
self-issue one. What this folder provides is the **groundwork** a practitioner would expect to
find already in place before a Type 1 engagement is even worth starting: named control
objectives, control activities mapped to real technical controls, and an honest account of
what's fully implemented versus partial versus still a gap (see `control-objectives-matrix.md`).
Where a control is a gap, it is documented as a gap, not glossed over — a practitioner will find
it either way, and a Type 2 opinion additionally requires the control to have been *operating*,
not just designed, across the whole observation window, so gaps closed the week before an
engagement starts do not yet qualify.

Realistic path from here: (1) close the control gaps identified in `control-objectives-matrix.md`
and `../iso-27001-27701-readiness.md`, (2) start collecting evidence continuously once controls
are in place (the observation window for a Type 2 report can't start retroactively), (3) engage
an assurance practitioner for a scoping conversation and, when ready, the Type 1 engagement, then
(4) run the Type 2 observation period. Don't promise a gym customer's auditor an ISAE 3402 report
date until a practitioner has actually scoped the engagement.

## Ownership and governance

This pack is owned and maintained by **Founder & CTO, UBQ Solutions FZ-LLC**, who is responsible
for keeping the control objectives and their current state accurate, ensuring the referenced
controls are implemented, and approving changes. Claims of external certification or attestation
(for example, "ISAE 3402 report", "ISAE 3402 compliant") must not be made until the corresponding
engagement has actually been completed and the report issued.

## Review cadence

This pack is reviewed **annually**, or whenever GymFlyte's billing, invoicing, or payment
processing architecture changes materially (e.g. a new payment gateway, a change to how
subscriptions are billed, a new financial data export). Owned by
**Founder & CTO, UBQ Solutions FZ-LLC**.
