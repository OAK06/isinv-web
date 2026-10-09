# Information Security Policy

## Purpose

Establish the top-level security program for GymFlyte, operated by UBQ Solutions FZ-LLC, so that
member, staff, and business data handled by the platform is protected against unauthorized
access, disclosure, alteration, and loss.

## Scope

Applies to all systems that store, process, or transmit GymFlyte data: the Laravel API
(`GymFlyteBack`), the Next.js application (`GymFlyteFront`), the PostgreSQL database, DigitalOcean
Spaces object storage, the DigitalOcean Kubernetes cluster, and all employees, contractors, and
sub-processors with access to any of the above.

## Policy Statements

- Security is a shared responsibility across engineering, not a bolted-on afterthought; every
  engineer with production access is bound by this policy and the `access-control-policy.md`.
- Data in transit is encrypted via TLS (managed through cert-manager on the cluster ingress).
  Plaintext HTTP is not an accepted production configuration.
- Object storage (DigitalOcean Spaces) is accessed only through short-lived signed URLs; buckets
  are not publicly listable or writable by default.
- Authentication uses Laravel Sanctum session-cookie auth with login rate-limiting; there is no
  bearer-token or long-lived API key path for end-user auth.
- Access to production systems (database, Kubernetes cluster, object storage, hosting provider
  consoles) is limited to personnel who need it for their role, per `access-control-policy.md`.
- Security-relevant application events are captured via audit logging (`ActivityLog`) and
  retained per `data-retention-and-disposal-policy.md`.
- No customer payment card data is stored by GymFlyte; all card handling is delegated to Stripe.
- Known vulnerabilities in dependencies are tracked and remediated on a risk-prioritized basis;
  critical vulnerabilities in internet-facing components are prioritized over low-severity
  findings in internal tooling.
- Security incidents are handled per `incident-response-plan.md`, not on an ad hoc basis.
- New systems, integrations, or third parties that will touch GymFlyte data must be evaluated per
  `vendor-and-subprocessor-management.md` before go-live.
- This policy does not by itself constitute technical control implementation — it states intent;
  actual control status is tracked in `iso-27001-27701-readiness.md`.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns this policy, approves exceptions, and is
  the escalation point for security decisions.
- **All engineers**: follow secure coding practices, report suspected vulnerabilities or
  incidents immediately per `incident-response-plan.md`, and complete onboarding security
  training annually.
- **Founder & CTO, UBQ Solutions FZ-LLC**: ultimate accountability for the security program at the organizational
  level.

## Review Cadence

Reviewed **annually** or upon material architecture change (e.g. new hosting provider, new
auth mechanism), owned by **Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Annex A A.5.1–A.5.4 (Policies for Information Security, Roles and
Responsibilities, Management Responsibilities), A.5.15 (Access Control), A.8.24 (Use of
Cryptography).
