# Change Management Policy

## Purpose

Define how changes to GymFlyte's codebase and production infrastructure are proposed, reviewed,
tested, deployed, and — if necessary — rolled back, so that changes reach production in a
controlled, reviewable, zero-downtime way.

## Scope

Covers all changes to the Laravel API (`GymFlyteBack`), the Next.js application
(`GymFlyteFront`), database schema/migrations, and the DigitalOcean Kubernetes deployment
manifests for both.

## Policy Statements

### Version control & review

- All application code lives in Git; `GymFlyteBack` and `GymFlyteFront` are independently
  versioned repositories, each with their own history.
- Changes are made on a branch and merged via pull request — direct pushes to the production
  branch are not the normal path for application code.
- **Code review is mandatory** before merge: at minimum one other engineer reviews the diff for
  correctness, security implications, and adherence to each project's `CLAUDE.md` conventions
  before approval.
- Commit messages describe the *why*, not just the *what*, so the history stays useful for
  incident review and audits.

### CI test gates

- Both repositories carry GitHub Actions test workflows that run the test suite (Pest on the
  backend, Vitest on the frontend) on every pull request.
- These workflows are the mandatory quality gate for merges once GitHub Actions minutes are
  enabled on the organization account — a change does not merge without a passing run.
- Until Actions minutes are enabled, the same test suites are run locally by the reviewer/author
  before merge as an interim manual gate; enabling the automated gate is tracked as an open item
  in `iso-27001-27701-readiness.md`.

### Staging vs. production

- Changes are validated against a **staging environment** (isolated dev/staging namespace,
  separate database and secrets from production) before being promoted to production.
- Production configuration (secrets, environment variables, database) is never shared with
  staging; staging uses its own DigitalOcean-managed database and Stripe test-mode keys.

### Deployment process

- Production deploys go to the DigitalOcean Kubernetes cluster (namespace `gymflyte`) via a
  rolling deployment strategy (`maxUnavailable: 0`, `maxSurge: 1`): a new pod is confirmed ready
  by its readiness probe before the old pod is terminated, giving zero-downtime deploys even at
  single-replica scale.
- The frontend runs as a standalone Next.js build (`node server.js` as PID1) specifically so it
  receives a clean `SIGTERM` on rolling deploys, allowing in-flight requests to finish.
- Container images are built and pushed, then the deployment is updated to the new image tag;
  the cluster then performs the rolling replacement automatically.

### Database migrations

- Schema changes ship as versioned Laravel migrations, reviewed alongside the code that depends
  on them, and applied as part of the deploy process before (or alongside) the new application
  version goes live.
- Migrations are written to be backward-compatible where practical (e.g. additive column changes
  deploy before the code that requires them) to avoid a window where running code and schema are
  mismatched.
- Destructive migrations (column/table drops) are only applied after the code that depended on
  the removed structure has already been deployed and confirmed healthy.

### Rollback

- A failed or misbehaving deploy is rolled back by redeploying the last known-good image tag
  through the same rolling-deployment mechanism, restoring service without a full outage.
- Migrations that cannot be safely reversed (e.g. destructive drops) are avoided in the same
  deploy as the application change they support, precisely so a rollback of the application code
  does not require an equally risky migration rollback.

### Emergency changes

- Emergency fixes (active incident, per `incident-response-plan.md`) may bypass the normal
  staging-soak period, but still require code review before merge — review may happen
  concurrently with deployment during a SEV1/SEV2, but is never skipped entirely.
- Every emergency change is reviewed retroactively as part of the incident post-mortem to confirm
  it was safe and to capture any follow-up hardening.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns this policy, approves exceptions, and
  is accountable for the CI/CD pipeline's health.
- **Reviewers**: every engineer approving a pull request is responsible for verifying tests pass
  and the change follows the relevant project's conventions before approving.
- **Deploying engineer**: responsible for confirming staging validation and monitoring the
  rollout (pod readiness, error rates) after triggering a production deploy.

## Review Cadence

Reviewed **annually** or whenever the CI/CD pipeline or deployment topology changes materially.
Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.

## Maps to

ISO/IEC 27001 Annex A A.8.32 (Change Management), A.8.25 (Secure Development Life Cycle), A.8.31
(Separation of Development, Test and Production Environments), A.8.29 (Security Testing in
Development and Acceptance).
