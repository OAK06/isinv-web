# Complementary User Entity Controls (CUECs)

## Purpose

List the controls the **gym customer** (the "user entity" in ISAE 3402 terminology) is expected to
perform themselves, on top of GymFlyte's own controls, for the financial data in GymFlyte to be
reliable end to end. An ISAE 3402 report never covers 100% of the path from "a member swipes a card"
to "the gym's financial statements are correct" — GymFlyte controls the platform; the gym
controls how it configures and operates within that platform. Both halves have to hold. This is
a standard, expected section of any ISAE 3402 report — its presence is not a disclaimer of
GymFlyte's own responsibility, it is where responsibility that structurally cannot sit with the
service organization is made explicit instead of silently assumed.

## Scope

Applies to every gym, studio, or personal-trainer tenant operating on GymFlyte who relies (or
whose external accountant/auditor relies) on GymFlyte transaction data for their own financial
reporting.

## Complementary controls the gym is expected to perform

### Staff access and role configuration

- **Assign staff roles deliberately, not by default.** GymFlyte provides per-branch RBAC with
  granular permissions (sales, refunds, invoicing, billing, reporting), but it is the gym owner's
  responsibility to actually configure distinct roles for distinct duties — e.g. not giving every
  front-desk staff member permission to process refunds if segregation between "who sells" and
  "who refunds" matters to the gym's own control environment. See `control-objectives-matrix.md`
  section (f) — GymFlyte supplies the capability, the gym exercises it.
- **Deprovision staff promptly.** When an employee leaves or changes role, the gym owner (or a
  staff member with the relevant permission) is responsible for removing or adjusting that
  person's GymFlyte access — GymFlyte cannot know a real-world employment change happened unless
  the gym reflects it in the system.
- **Review the audit trail periodically.** GymFlyte records who created, modified, or deleted
  financial records (`ActivityLog`); the gym is expected to periodically review this trail
  (or the specific parts relevant to their own risk areas) rather than assume it is watched
  for them — GymFlyte retains the data, but proactive review of a specific tenant's activity is
  the gym's own control, not an automated GymFlyte alert.

### Sales, refunds, and revenue review

- **Review sales and refund activity regularly.** The gym is responsible for periodically
  reviewing its own POS sales, invoices, and refunds for anomalies (e.g. an unusually large
  refund, a discount pattern that doesn't match policy) — GymFlyte records every transaction
  accurately and completely, but does not independently judge whether a given transaction was
  *appropriate* for that gym's business.
- **Reconcile revenue reports against expectations.** Gyms using GymFlyte's revenue/reporting
  features are expected to sanity-check totals (e.g. against a bank deposit summary or their own
  daily cash-out process for physical cash transactions) as part of their own close process,
  rather than treating GymFlyte's reports as a substitute for that reconciliation.

### Stripe payment reconciliation

- **Reconcile Stripe payouts against GymFlyte's payment records.** GymFlyte records what it
  told Stripe to charge and what Stripe's webhook confirmed; the actual movement of funds into
  the gym's bank account happens on Stripe's payout schedule and is Stripe's own process, outside
  GymFlyte's control. The gym (or its bookkeeper) is expected to periodically reconcile Stripe
  payout totals against GymFlyte's invoice/payment records as part of standard cash-reconciliation
  practice — the same way any business reconciles a payment processor against its books.
  Stripe itself is a SOC-audited payment processor; GymFlyte's controls stop at "the charge was
  submitted correctly and idempotently" (see `control-objectives-matrix.md` section (d)) —
  Stripe's own control environment governs settlement and payout.
- **Keep the gym's connected Stripe account (or API keys) current and in good standing.** If a
  gym's Stripe account is restricted, disconnected, or its API keys rotated outside GymFlyte,
  member charges will fail until the gym reconnects — this is a gym-side operational
  responsibility, not something GymFlyte can detect or fix on the gym's behalf beyond surfacing
  the failure.
- **Process any manual/off-platform refund correctly on the Stripe side.** As noted in
  `control-objectives-matrix.md` section (d), GymFlyte's own Stripe refund automation is
  currently a gap — until that is closed, a gym issuing a refund must ensure the actual Stripe-side
  refund is processed (currently a manual step), not just recorded in GymFlyte.

### Tax configuration

- **Configure correct tax rates for the gym's jurisdiction.** GymFlyte calculates and applies
  tax on invoices/sales based on the rates and settings the gym configures; GymFlyte does not
  independently determine what tax rate is legally correct for a given gym's location or
  business type. An incorrectly configured tax rate will be applied *consistently and
  accurately* by GymFlyte, but consistency does not make it *correct* — that determination and
  its ongoing accuracy is the gym's (or their tax advisor's) responsibility.
- **Keep tax configuration current with rate changes.** If a jurisdiction's tax rate changes,
  updating GymFlyte's tax settings to reflect that change is the gym's responsibility.

### Member consent and terms

- **Obtain and maintain member consent for recurring billing.** GymFlyte captures and stores
  membership terms-acceptance records (method, timestamp, optional e-signature) at the point a
  member enrolls or a plan is created, but it is the gym's responsibility to ensure the terms
  presented to the member (pricing, billing frequency, cancellation policy) are accurate and
  that the gym's own business practices around member sign-up align with what's configured in
  GymFlyte — GymFlyte records the consent event, it does not draft or validate the gym's
  membership terms.
- **Communicate pricing/plan changes to members appropriately.** If a gym changes a membership
  plan's price, GymFlyte will bill the new price on the schedule configured, but notifying
  affected members of the change (per the gym's own contractual and legal obligations to its
  members) is the gym's responsibility, not an automated GymFlyte function.

### Data accuracy at the source

- **Enter accurate member, plan, and pricing data.** GymFlyte's completeness and accuracy
  controls (`control-objectives-matrix.md` section (a)) ensure that whatever data is entered is
  recorded reliably and without corruption — they cannot correct a gym staff member entering the
  wrong price on a manual sale or the wrong plan on a member signup. Data-entry accuracy at the
  point of input remains the gym's operational responsibility.

## Roles & Responsibilities

- **GymFlyte / UBQ Solutions FZ-LLC**: documents these CUECs, communicates them to gym customers
  (e.g. via onboarding material or this pack when shared under NDA/due-diligence request), and
  keeps the list current as platform capabilities change.
- **Gym owners (tenant Owners in GymFlyte)**: responsible for actually performing the controls
  listed above within their own operation — role configuration, staff deprovisioning, sales/
  refund review, Stripe reconciliation, tax configuration, and member consent/communication.

## Review Cadence

Reviewed **annually**, or whenever a change to GymFlyte's feature set shifts which controls sit
on GymFlyte's side versus the gym's side (e.g. if Stripe refund automation ships, the
corresponding CUEC above should be removed or narrowed). Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to ISAE 3402 control objectives

Applies across all objectives in `control-objectives-matrix.md` — CUECs are the user-entity half
of every control objective a service organization's report addresses.
