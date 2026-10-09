# Access Control Policy

## Purpose

Define how access to GymFlyte systems and data is granted, restricted, reviewed, and revoked, so
that individuals and services can only reach what their role requires.

## Scope

Covers application-level access (tenant company data, per-branch scoped roles/permissions inside
GymFlyte), and infrastructure-level access (PostgreSQL database, DigitalOcean Spaces,
DigitalOcean Kubernetes cluster, source-control, CI/CD, hosting/provider consoles).

## Policy Statements

### Least privilege & RBAC

- Application access follows role-based access control (RBAC) with **per-branch scoped roles and
  permissions** — a user's effective permissions are limited to the branch(es) they are assigned
  to, not the tenant company as a whole, unless explicitly granted company-wide (e.g. owner role,
  multi-branch reporting).
- Roles are granted on a least-privilege basis: request the minimum permission set needed for the
  job function, expand only when justified.
- Super Admin (cross-tenant, platform-level) access is a distinct, restricted role — separate
  credentials, not a per-tenant role — held only by **Founder & CTO, UBQ Solutions FZ-LLC**.

### Authentication

- End-user authentication is via Laravel Sanctum session-cookie auth with login rate-limiting to
  slow credential-stuffing/brute-force attempts.
- **MFA is required for all admin/owner-level accounts** (platform Super Admin and tenant Owner
  roles) Gap — not yet enforced in the product; see `iso-27001-27701-readiness.md`. Target:
  TOTP enforced before Q4 2026.
- Passwords must meet: minimum **12** characters, no reused/breached passwords (checked against
  the HaveIBeenPwned range API where feasible), no forced periodic rotation
  without cause (rotation only on suspected compromise, per current best practice).
- Session cookies are scoped to `SESSION_DOMAIN`, HttpOnly, and Secure-flagged in production.

### Provisioning & deprovisioning

- New employee/contractor infrastructure access (database, cluster, Spaces, provider consoles,
  source control) is requested via **a ticket to the platform owner** and approved by
  **Founder & CTO** before being granted.
- Access is reviewed **quarterly** — an access recertification of who holds what, removing
  anything no longer justified.
- On termination or role change, access is revoked/adjusted **within 24 hours** of the
  effective date; a checklist of systems to touch (cluster kubeconfig, DB roles, Spaces keys,
  GitHub org, Stripe dashboard, hosting console) lives at **the ActivityLog audit trail and the DigitalOcean and GitHub provider consoles**.
- Shared/generic credentials are not used for infrastructure access; each engineer has individual,
  attributable credentials wherever the platform supports it.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: approves infrastructure access requests, owns
  the quarterly access review.
- **Tenant Owners** (in-app): responsible for provisioning/deprovisioning their own staff roles
  within GymFlyte per their branch/company scope.
- **All personnel**: responsible for safeguarding their own credentials and reporting suspected
  compromise immediately.

## Review Cadence

Reviewed **annually**; access recertification **quarterly**. Owned by
**Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Annex A A.5.15–A.5.18 (Access Control, Identity Management, Authentication
Information, Access Rights), A.8.2–A.8.5 (Privileged Access Rights, Information Access
Restriction, Access to Source Code, Secure Authentication).
