# ISAE 3402 Control Objectives Matrix

## Purpose

Map GymFlyte's actual technical and procedural controls to the ISAE 3402 control objectives most
relevant to a gym customer's Internal Control over Financial Reporting (ICFR) — completeness and
accuracy of transaction recording, authorization, access to financial data, payment processing
integrity, change management over billing logic, segregation of duties, and billing timeliness.
This is the core deliverable of the ISAE 3402 pack: it is what an assurance practitioner would
review first when scoping a Type 1 engagement, and what the control activities below would
eventually need evidence trails for to support a Type 2 opinion.

## Scope

Covers the parts of GymFlyte that produce or move financial data a gym customer relies on: POS /
sales (`app/Domain/POS/Sales`), invoicing (`app/Domain/POS/Invoice`), member subscriptions and
recurring billing (`app/Domain/MemberPlan`, `app/Domain/MemberPlanRenewal`), payment processing
(`app/Domain/PaymentGateways/Services/StripeGateway.php`), and the RBAC/audit layer that
constrains who can touch any of it.

## State legend

Consistent with `../iso-27001-27701-readiness.md`: **Have** (control is implemented and in
production), **Partial** (control exists but has a real limitation), **Gap** (not yet
implemented).

## Control objectives

### (a) Completeness and accuracy of transaction recording

Objective: sales, POS transactions, invoices, and payments are recorded once, completely, and
accurately.

| Control activity | Reference | State |
|---|---|---|
| Invoices, invoice line items, and the sale/payment records they derive from are written inside a single database transaction, so a partial failure never leaves an invoice without its items or a sale without its invoice | `DB::transaction()` wraps creation in `app/Domain/POS/Sales/Http/Controllers/SalesController.php`, `app/Actions/Invoice/CreateInvoice.php` call sites, `app/Domain/MemberPlan/Actions/CreateMemberPlan.php`, `app/Domain/MemberPlanRenewal/Jobs/ProcessCreateMemberPlanRenewal.php` — 60+ transaction-wrapped write paths across the financial domains | **Have** |
| Required financial fields (`company_id`, `branch_id`, `member_id`, `item_count`, `total_price`, `total_tax`, `state`, `entity_type`, `operation_type`) are server-side validated before an invoice can be created — a request missing any of these is rejected, not silently recorded with nulls | `App\Actions\Invoice\CreateInvoice::validate()` | **Have** |
| Membership renewal/billing runs as scheduled, idempotent jobs rather than ad hoc code paths, so the same billing cycle cannot double-record a charge | `app/Domain/MemberPlanRenewal/Jobs/ProcessCreateMemberPlanRenewal.php`, `App\Console\Commands\RenewalCommand`, `App\Console\Commands\PayMembershipCommand`, `App\Console\Commands\PlatformBillCommand` | **Have** |
| Database-level constraints (unique keys, required columns) back up application validation so a bug in application code cannot silently corrupt financial tables | Migrations under `database/migrations` for `invoices`, `member_plans`, `company_subscriptions`, `company_subscription_addons` (the last carries a real unique index that surfaced a bug — see Payment Processing Integrity below) | **Partial** — constraints exist per-table but were not purpose-built with a financial-reporting completeness review; no dedicated reconciliation report cross-checks invoice totals against POS sale totals or payment ledger totals end to end |
| Automated test coverage exercises the sales/invoice/refund write paths, catching regressions before they reach production | `app/Domain/POS/Sales/Tests/SalesTest.php`, `app/Domain/POS/Refund/Tests/RefundTest.php`, `app/Domain/POS/Invoice/Tests/MyInvoiceTest.php`, `app/Domain/MemberPlan/Tests/MemberPlanTest.php` (Pest) | **Have** |

### (b) Authorisation of financial-record creation and modification

Objective: only authorised users can create or modify financial records (sales, invoices,
member plans, refunds).

| Control activity | Reference | State |
|---|---|---|
| Every financial-record write endpoint is gated by role-based permissions, scoped per branch — a staff member without the relevant permission on the relevant branch cannot create a sale, invoice, refund, or member plan | RBAC via Spatie permissions + `has-branch-permission` gate, described in `../access-control-policy.md`; enforced across POS/Invoice/MemberPlan controllers | **Have** |
| Permission grants follow least privilege and are scoped to the branch(es) a user is assigned to, not the whole tenant company, unless explicitly company-wide (owner role) | `../access-control-policy.md` "Least privilege & RBAC" | **Have** |
| Refunds are a distinct, separately-permissioned action from creating a sale, so processing a refund requires its own authorisation rather than inheriting from general POS access | `app/Domain/POS/Refund` (dedicated domain, own controller/tests) | **Have** |
| MFA is required on the accounts with the broadest financial reach (tenant Owner, platform Super Admin) | `../access-control-policy.md` "Authentication" — explicitly a **Gap**, target TOTP enforcement before Q4 2026 | **Gap** |
| A role cannot be renamed to impersonate a privileged built-in role (e.g. "Super Admin") to escalate authorisation | `App\Domain\Role\Rules\NotReservedRoleName` applied to both create and update role validation (`StoreRole`, `UpdateRole`) — closes a real privilege-escalation path found and fixed 2026-07-20 | **Have** |

### (c) Access to financial data

Objective: access to financial data (sales, invoices, payment records, revenue reports) is
restricted to authorised users and access events are auditable.

| Control activity | Reference | State |
|---|---|---|
| Financial data access follows the same least-privilege RBAC as write access — viewing sales/invoice/reporting data requires the corresponding `view` permission on the relevant branch | `../access-control-policy.md`, permission set in `PermissionSeeder` | **Have** |
| Every create, update, and delete on a financially-relevant model is captured in an immutable audit trail recording who made the change, what changed (old/new values), and when | `App\Traits\ActivityLogTrait` (model-boot hooks on `created`/`updated`/`deleted`) writing to `ActivityLog`, tenant-scoped to `company_id`/`branch_id`; viewable via `ActivityLogController` | **Have** |
| Cross-tenant access to another gym's financial/billing data is prevented even when a client supplies a crafted or stale branch/company identifier | `ResolvesRequestCompany::resolveCompany()` authorizes the resolved company against the requesting user's actual branch roles before returning any billing/subscription data — fixed 2026-07-20 after a real cross-tenant billing leak was found in testing (`OnboardingTest::testOwnerCannotSeeAnotherCompanysBilling`) | **Have** |
| Platform-level (Super Admin / GymFlyte staff) access to any tenant's financial data is itself a distinct, restricted, individually-attributed role rather than shared credentials | `../access-control-policy.md` "Least privilege & RBAC" | **Have** |
| Audit log retention and disposal follows a defined schedule rather than growing unbounded or being purged ad hoc | `../data-retention-and-disposal-policy.md` | **Have** |

### (d) Payment processing integrity

Objective: member/customer payments are processed accurately, are not double-charged, and never
land on the wrong account; no card data is stored by GymFlyte.

| Control activity | Reference | State |
|---|---|---|
| No cardholder data (PAN, CVV, expiry) is ever stored by GymFlyte — all card capture and storage is delegated to Stripe (Stripe Checkout / Stripe-hosted payment methods) | `../information-security-policy.md` "No customer payment card data is stored"; confirmed in code — `StripeGateway` only ever passes `payment_method_id`/`customer_id` tokens, never raw card fields | **Have** |
| Recurring/automatic membership charges are idempotency-keyed per invoice, so a queue retry after a partial failure (e.g. a timeout after Stripe accepted the charge but before the local job recorded success) cannot charge the same invoice twice | `StripeGateway::charge()` — `$options['idempotency_key'] = 'membership_charge_inv_' . $data['invoice_id']` | **Have** — scoped per-invoice within Stripe's 24h idempotency window, appropriate for once-per-cycle auto-renewal billing; would need revisiting if the same invoice were ever intentionally re-charged within 24h |
| A gym's member charges and saved payment methods can only ever land on that gym's own connected Stripe account (or its own direct API keys) — never on GymFlyte's platform Stripe account by fallback or misconfiguration | `StripeGateway::guardGymAccount()` — a hard `abort_if($this->onPlatformAccount, 400, ...)` guard called at the top of every member-money-moving method (`createCustomer`, `savePaymentMethod`, `createPaymentSession`, `createDeferredCheckout`, `charge`) before any Stripe call is made | **Have** |
| Currency-conversion / cent-truncation errors in charge amounts are handled correctly (round, not truncate) so a member is never charged a rounded-down cent amount that silently underbills | `StripeGateway::charge()` — `(int) round($data['amount'] * 100)`, replacing an earlier cast-then-multiply pattern that truncated (e.g. 29.99 → 29.00); comment in code documents the fix explicitly | **Have** |
| Payment webhooks (Stripe → GymFlyte) are the source of truth for payment-status transitions, not client-side confirmation alone, so a member closing their browser mid-checkout cannot leave a payment recorded as successful when Stripe never confirmed it | `app/Domain/PaymentGateways/Http/Controllers/WebhookController.php`, `app/Domain/CompanySubscription/Http/Controllers/PlatformWebhookController.php` (signature-verified, own signing secrets) | **Have** |
| Failed card charges (e.g. insufficient funds) are handled as a distinct, non-fatal outcome rather than surfacing as an unhandled exception that could leave billing state inconsistent | `StripeGateway::charge()` — `catch (CardException $e) { return; }` leaves the invoice/subscription in its pre-charge state for the scheduled retry/past-due flow to pick up | **Have** |
| Refunds are processed through the same authorised Stripe path rather than a manual/out-of-band adjustment | `app/Domain/PaymentGateways/Services/StripeGateway::refund()` | **Gap** — the refund method on the payment gateway is currently a stub; refunds are recorded/tracked in GymFlyte's own `Refund` domain but do not yet call back to Stripe automatically, so a gym must still process the actual Stripe-side refund separately today |

### (e) Change management over billing / pricing / tax calculation logic

Objective: changes to code that computes prices, taxes, or billing amounts go through review and
automated testing before reaching production.

| Control activity | Reference | State |
|---|---|---|
| All changes to billing/pricing/invoice/payment code go through the same mandatory code-review gate as the rest of the codebase — no direct-to-production path for financial logic | `../change-management-policy.md` "Version control & review" | **Have** |
| Pricing and tax-relevant logic (`SubscriptionPricingService`, invoice tax fields, per-country plan prices) is covered by the same CI test suites (Pest backend, Vitest frontend) that gate other changes | `../change-management-policy.md` "CI test gates"; `app/Domain/POS/Sales/Tests/SalesTest.php`, `app/Domain/POS/Invoice/Tests/MyInvoiceTest.php`, `app/Domain/Finance/Tests/FinanceExportTest.php` | **Have (dormant)** — same standing gap as the general CI gate: workflows exist for both repos but are not yet the *enforced* merge gate until GitHub Actions minutes are enabled on the org account; interim manual local-run gate is in effect (`../change-management-policy.md`) |
| Schema changes to financial tables (invoices, invoice items, member plans, company subscriptions) ship as versioned, reviewed migrations, and destructive changes are sequenced only after dependent code is deployed and confirmed healthy | `../change-management-policy.md` "Database migrations" | **Have** |
| A failed or misbehaving billing-related deploy can be rolled back to the last known-good image without a full outage | `../change-management-policy.md` "Rollback"; zero-downtime rolling deploy strategy | **Have** |

### (f) Segregation of duties

Objective: no single individual can both initiate and fully conceal a financial transaction
without independent review.

| Control activity | Reference | State |
|---|---|---|
| Within a gym tenant, RBAC allows an owner to separate who can create sales/invoices from who can process refunds or edit roles/permissions, if the gym chooses to configure roles that way | `../access-control-policy.md` "Least privilege & RBAC"; refunds are a separately-permissioned action from `(d)` above | **Have (capability)** — the platform *supports* segregation of duties via granular per-branch roles; whether a given gym actually configures distinct roles for "creates sales" vs. "approves refunds" vs. "manages billing" is that gym's own operational choice, not something GymFlyte enforces |
| At the GymFlyte/platform level (GymFlyte's own engineering team), code review is mandatory before any change to financial logic merges — no single engineer can both write and merge a change to billing code unilaterally | `../change-management-policy.md` "Code review is mandatory" | **Have** |
| Full separation of duties across the GymFlyte engineering org (e.g. distinct "developer" vs. "deployer" vs. "database administrator" individuals) is not realistic at current team size | — | **Gap, documented as a Complementary User Entity Control limitation** — see `complementary-user-entity-controls.md` and the note below; this is disclosed rather than concealed, consistent with how small service organizations are expected to handle this control objective |

A small team cannot fully separate every financial-process duty the way a larger organization
can. This is a known, disclosed limitation rather than an oversight, and is exactly the kind of
gap ISAE 3402 reports typically address via a **Complementary User Entity Control (CUEC)** — the
user entity (the gym) is expected to perform its own independent review of the financial data it
relies on (see `complementary-user-entity-controls.md`), rather than relying solely on GymFlyte's
internal segregation of duties.

### (g) Timeliness / cutoff of billing

Objective: charges and invoices are recorded and billed in the correct period, on schedule,
without unrecorded delay or premature recognition.

| Control activity | Reference | State |
|---|---|---|
| Every invoice carries an explicit `bill_at` timestamp set at creation (defaulting to the creation time, or an explicit scheduled date for deferred billing), so the billing period an invoice belongs to is unambiguous and not inferred from a mutable `created_at`/`updated_at` | `App\Actions\Invoice\CreateInvoice::create()` — `'bill_at' => $data['bill_at'] ?? now()` | **Have** |
| Recurring membership and platform-subscription billing runs on a fixed daily schedule that only processes items actually due (`bill_at <= today`), rather than an ad hoc or manually-triggered process that could drift | `App\Console\Commands\RenewalCommand`, `App\Console\Commands\PayMembershipCommand`, `App\Console\Commands\PlatformBillCommand` (`whereDate('bill_at', '<=', today())`) | **Have** |
| Overdue/delinquent billing follows a defined, consistently-applied grace period before suspension, rather than an arbitrary or manually-decided cutoff | `PlatformBillCommand` — fixed 7-day grace window (`GRACE_DAYS`) before a past-due subscription and its company are suspended | **Have** |
| The scheduler that runs these daily billing commands is itself confirmed running and monitored, so a stalled scheduler cannot silently delay every gym's billing cutoff | Scheduler deployment confirmed running as of the 2026-07-26 security/deploy audit (`../iso-27001-27701-readiness.md` A.8.16 note: no dedicated alerting yet if it stalls again) | **Partial** — the scheduler runs, but there is no automated alert if a scheduled billing run fails to execute or errors out; detection today is reactive (log review), same underlying gap as A.8.16 in `../iso-27001-27701-readiness.md` |

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns this matrix, keeps control states current as they
  move from Gap → Partial → Have, and is accountable for closing the identified gaps (Stripe
  refund automation, MFA enforcement, enforced CI gate, billing-scheduler alerting).
- **All engineers**: responsible for keeping the referenced code paths (transactions,
  idempotency keys, guards, audit-log hooks) intact when modifying financial-domain code, and
  for flagging any change that weakens a control listed here during code review.

## Review Cadence

Reviewed **annually**, or whenever billing, invoicing, payment-gateway, or subscription logic
changes materially — consistent with `00-README.md`'s review cadence for this pack. Owned by
**Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to ISAE 3402 control objectives

Completeness & Accuracy of Transaction Recording, Authorization, Access to Financial Data,
Payment Processing Integrity, Change Management (Billing/Pricing Logic), Segregation of Duties,
Timeliness/Cutoff of Billing.
