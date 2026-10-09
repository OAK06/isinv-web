# Statement of Applicability (SoA)

## Purpose

The Statement of Applicability is the core deliverable of an ISO/IEC 27001 ISMS: a record of
every control in Annex A:2022, whether it applies to GymFlyte, its current implementation status,
and where the implementation is documented or evidenced. It is produced from the risk assessment
in `../risk-assessment-policy.md` and `risk-treatment-plan.md` — controls are included because a
risk or a contractual/legal/regulatory requirement calls for them, not by default.

## Scope

Covers all 93 controls across the four Annex A:2022 themes: A.5 Organizational (37), A.6 People
(8), A.7 Physical (14), A.8 Technological (34). Status values match the vocabulary already used in
`../iso-27001-27701-readiness.md` (**Have** / **Partial** / **Gap**) so the two documents stay
consistent; where a control is judged not applicable, that judgement and its reasoning are stated
rather than the control being silently omitted.

## A.5 Organizational Controls (A.5.1–A.5.37)

| Control | Applicable | Status | Implementation / reference |
|---|---|---|---|
| A.5.1 Policies for information security | Yes — a documented policy set is foundational | Have | `../information-security-policy.md` and the full `compliance/` pack, each with an assigned owner and review cadence |
| A.5.2 Information security roles and responsibilities | Yes | Have | Every policy carries a Roles & Responsibilities section naming Founder & CTO, UBQ Solutions FZ-LLC as owner |
| A.5.3 Segregation of duties | Yes, at current team size best-effort | Partial | PR review is mandatory before merge (`../change-management-policy.md`); with a small engineering team, full segregation between development and production-deploy authority is not yet formally enforced |
| A.5.4 Management responsibilities | Yes | Have | `../information-security-policy.md` — Founder & CTO holds ultimate accountability for the security program |
| A.5.5 Contact with authorities | Yes — GDPR supervisory authority contact is required | Have | `../incident-response-plan.md` breach-notification process (72-hour authority notification) |
| A.5.6 Contact with special interest groups | Yes — informal threat awareness | Gap | No formal membership in a security information-sharing group or ISAC yet; dependency/vulnerability advisories are followed informally |
| A.5.7 Threat intelligence | Yes | Partial | Handled reactively via dependency-vulnerability tracking (`../information-security-policy.md`); no structured/subscribed threat-intel feed yet |
| A.5.8 Information security in project management | Yes | Partial | Security review is implicit in mandatory code review (`../change-management-policy.md`); not yet a formal gate in a project-management process |
| A.5.9 Inventory of information and other associated assets | Yes | Have | System inventory defined in `../information-security-policy.md` scope and `isms-scope.md` (API, app, database, Spaces, cluster, sub-processors) |
| A.5.10 Acceptable use of information and other associated assets | Yes | Have | `../information-security-policy.md` — acceptable use is part of the top-level policy binding all engineers with production access |
| A.5.11 Return of assets | Yes | Have | `../access-control-policy.md` deprovisioning checklist (cluster kubeconfig, DB roles, Spaces keys, GitHub org, Stripe dashboard, hosting console) on termination |
| A.5.12 Classification of information | Yes | Partial | Data categories are defined by type in `../data-retention-and-disposal-policy.md` (account data, special-category health data, financial records, logs); no formal classification labelling scheme (e.g. Public/Internal/Confidential/Restricted) applied on top of those categories yet |
| A.5.13 Labelling of information | Yes | Gap | No systematic technical labelling of data by classification level; relies on the categories in A.5.12 rather than applied labels |
| A.5.14 Information transfer | Yes | Have | TLS in transit (`../information-security-policy.md`), signed short-lived Spaces URLs, DPA-governed transfer to sub-processors (`../vendor-and-subprocessor-management.md`) |
| A.5.15 Access control | Yes | Have | `../access-control-policy.md` — RBAC with per-branch scoped roles, least privilege |
| A.5.16 Identity management | Yes | Have | Individual, attributable credentials for infrastructure access; no shared/generic credentials (`../access-control-policy.md`) |
| A.5.17 Authentication information | Yes | Have | Password policy (12-char minimum, breach-checked), Sanctum session cookies HttpOnly/Secure (`../access-control-policy.md`) |
| A.5.18 Access rights | Yes | Have | Quarterly access recertification, least-privilege RBAC (`../access-control-policy.md`) |
| A.5.19 Information security in supplier relationships | Yes | Have | `../vendor-and-subprocessor-management.md` due-diligence process |
| A.5.20 Addressing information security within supplier agreements | Yes | Have | DPA/SCC requirement before go-live (`../vendor-and-subprocessor-management.md`) |
| A.5.21 Managing information security in the ICT supply chain | Yes | Partial | Direct sub-processors (Stripe, DigitalOcean, SMTP2GO) are evaluated; their own upstream sub-processors are not independently re-verified beyond their published DPAs |
| A.5.22 Monitoring, review and change management of supplier services | Yes | Partial | Sub-processor list reviewed quarterly (`../vendor-and-subprocessor-management.md`); recurring formal security re-review of each vendor is not yet on a tracked cadence (matches the Partial status for this control in `../iso-27001-27701-readiness.md`) |
| A.5.23 Information security for use of cloud services | Yes — the entire stack is cloud-hosted | Have | DigitalOcean managed PostgreSQL/Kubernetes/Spaces evaluated under `../vendor-and-subprocessor-management.md`; signed URLs and non-public buckets per `../information-security-policy.md` |
| A.5.24 Information security incident management planning and preparation | Yes | Have | `../incident-response-plan.md` — severity levels, response steps, roles defined in advance |
| A.5.25 Assessment and decision on information security events | Yes | Have | `../incident-response-plan.md` — Incident Commander triages severity within 1 hour of detection |
| A.5.26 Response to information security incidents | Yes | Have | `../incident-response-plan.md` — contain, eradicate, recover steps |
| A.5.27 Learning from information security incidents | Yes | Have | `../incident-response-plan.md` — blameless post-mortem within 5 business days feeding the risk register |
| A.5.28 Collection of evidence | Yes | Partial | `ActivityLog` audit trail provides an evidentiary record for application-level events; no formal forensic evidence-handling procedure (chain of custody) beyond that |
| A.5.29 Information security during disruption | Yes | Partial | Continuity priority order defined (`../business-continuity-and-dr.md`: database → API/app → storage → workers); not yet tested end-to-end via a real disruption drill |
| A.5.30 ICT readiness for business continuity | Yes | Partial | RPO/RTO targets set (24h/24h) in `../business-continuity-and-dr.md`, but not yet validated by a real recovery drill, and the single-node cluster is an open HA gap — see `risk-treatment-plan.md` |
| A.5.31 Legal, statutory, regulatory and contractual requirements | Yes | Have | GDPR obligations addressed in `../data-protection-and-gdpr-policy.md`; financial record retention aligned to UAE and international accounting norms in `../data-retention-and-disposal-policy.md` |
| A.5.32 Intellectual property rights | Yes | Have | Standard practice — all product code is proprietary to UBQ Solutions FZ-LLC under employment/contractor agreements; no separate IP register needed at current scale |
| A.5.33 Protection of records | Yes | Have | Retention windows and disposal rules per category (`../data-retention-and-disposal-policy.md`) |
| A.5.34 Privacy and protection of PII | Yes | Have | `../data-protection-and-gdpr-policy.md` — controller/processor roles, lawful bases, DSAR handling |
| A.5.35 Independent review of information security | Yes | Gap | No independent (non-owner) review of the ISMS/security program has been performed yet; this is the internal-audit gap flagged in `iso27001-clauses-4-10.md` Clause 9 |
| A.5.36 Compliance with policies, rules and standards for information security | Yes | Partial | Policy pack exists with owner sign-off; no formal compliance-audit checklist run against it yet beyond the quarterly `../iso-27001-27701-readiness.md` self-assessment |
| A.5.37 Documented operating procedures | Yes | Have | Deployment, rollback, and migration procedures documented in `../change-management-policy.md`; incident response steps in `../incident-response-plan.md` |

## A.6 People Controls (A.6.1–A.6.8)

| Control | Applicable | Status | Implementation / reference |
|---|---|---|---|
| A.6.1 Screening | Yes | Partial | Background/reference checks are performed informally for new hires at current team size; not yet a documented, consistent pre-employment screening procedure |
| A.6.2 Terms and conditions of employment | Yes | Have | Standard employment/contractor agreements include confidentiality and acceptable-use obligations, reinforced by `../information-security-policy.md` |
| A.6.3 Information security awareness, education and training | Yes | Partial | Annual onboarding security training is committed to in `../information-security-policy.md`; not yet delivered on a tracked, evidenced schedule for the current team |
| A.6.4 Disciplinary process | Yes | Have | Standard employment disciplinary process applies to confirmed policy violations; handled as part of normal HR process rather than a security-specific procedure |
| A.6.5 Responsibilities after termination or change of employment | Yes | Have | `../access-control-policy.md` — access revoked/adjusted within 24 hours of the effective date |
| A.6.6 Confidentiality or non-disclosure agreements | Yes | Have | Standard NDA/confidentiality terms in employment and contractor agreements |
| A.6.7 Remote working | Yes — the team works remotely | Partial | Session-cookie auth, TLS, and least-privilege access apply regardless of work location (`../access-control-policy.md`); no separate remote-working-specific policy (e.g. approved-network requirements) documented yet |
| A.6.8 Information security event reporting | Yes | Have | `../incident-response-plan.md` — "All personnel" responsible for reporting suspected compromise immediately |

## A.7 Physical Controls (A.7.1–A.7.14)

GymFlyte operates no owned data centers, server rooms, or co-located hardware — all in-scope
systems run on DigitalOcean managed infrastructure. Physical controls over that infrastructure are
therefore **applicable but inherited**: satisfied through DigitalOcean's own physical security and
data-center certifications rather than directly by GymFlyte, and relied upon via the vendor
due-diligence process in `../vendor-and-subprocessor-management.md`. A small number of controls
(A.7.7, A.7.9, A.7.14) apply directly to UBQ Solutions FZ-LLC's own office equipment (laptops
used to access production).

| Control | Applicable | Status | Implementation / reference |
|---|---|---|---|
| A.7.1 Physical security perimeters | Yes (inherited) | Have | DigitalOcean data-center physical perimeter controls, relied upon via `../vendor-and-subprocessor-management.md` due diligence |
| A.7.2 Physical entry | Yes (inherited) | Have | DigitalOcean data-center entry controls |
| A.7.3 Securing offices, rooms and facilities | Yes (inherited) | Have | DigitalOcean facility security; GymFlyte has no in-scope owned facility |
| A.7.4 Physical security monitoring | Yes (inherited) | Have | DigitalOcean facility monitoring |
| A.7.5 Protecting against physical and environmental threats | Yes (inherited) | Have | DigitalOcean facility environmental controls |
| A.7.6 Working in secure areas | No | N/A | No GymFlyte-controlled secure area exists; all infrastructure access is remote/logical, governed by `../access-control-policy.md` instead |
| A.7.7 Clear desk and clear screen | Yes — applies to staff endpoints | Partial | Standard practice expected of remote staff; not yet a documented, enforced policy |
| A.7.8 Equipment siting and protection | Yes (inherited) | Have | DigitalOcean data-center equipment siting |
| A.7.9 Security of assets off-premises | Yes — staff laptops used to access production | Partial | Access is scoped/least-privilege and session-based (`../access-control-policy.md`); no separate device-management (MDM) or full-disk-encryption enforcement policy documented yet |
| A.7.10 Storage media | Yes (inherited, plus disposal) | Have | Object storage durability inherited from DigitalOcean Spaces; disposal handled per `../data-retention-and-disposal-policy.md` |
| A.7.11 Supporting utilities | Yes (inherited) | Have | DigitalOcean data-center power/cooling redundancy |
| A.7.12 Cabling security | Yes (inherited) | Have | DigitalOcean data-center cabling security |
| A.7.13 Equipment maintenance | Yes (inherited) | Have | DigitalOcean manages underlying hardware maintenance for managed PostgreSQL/Kubernetes/Spaces |
| A.7.14 Secure disposal or re-use of equipment | Yes (inherited) | Have | `../data-retention-and-disposal-policy.md` — decommissioned infrastructure wiped/destroyed per DigitalOcean's data-sanitization practices |

## A.8 Technological Controls (A.8.1–A.8.34)

| Control | Applicable | Status | Implementation / reference |
|---|---|---|---|
| A.8.1 User endpoint devices | Yes | Partial | No formal endpoint-management (MDM, disk encryption enforcement) policy at current team size; access itself is least-privilege and session-scoped |
| A.8.2 Privileged access rights | Yes | Have | Super Admin is a distinct, restricted, separately-credentialed role held only by Founder & CTO (`../access-control-policy.md`) |
| A.8.3 Information access restriction | Yes | Have | Per-branch scoped RBAC restricts application data access to what a role requires (`../access-control-policy.md`) |
| A.8.4 Access to source code | Yes | Have | Source lives in Git with individual attributable access; no shared credentials (`../access-control-policy.md`, `../change-management-policy.md`) |
| A.8.5 Secure authentication | Yes | Partial | Laravel Sanctum session-cookie auth with login rate-limiting is in place (**Have**); MFA on admin/owner accounts is not yet enforced (**Gap**) — see `risk-treatment-plan.md` |
| A.8.6 Capacity management | Yes | Partial | Node resource utilization is watched manually (`kubectl top nodes`) per `../business-continuity-and-dr.md`; no automated capacity alerting yet |
| A.8.7 Protection against malware | Yes | Have | Managed container base images and DigitalOcean platform-level protections; no end-user file-execution surface in the product itself |
| A.8.8 Management of technical vulnerabilities | Yes | Have | `../information-security-policy.md` — dependency vulnerabilities tracked and remediated risk-prioritized, internet-facing components first |
| A.8.9 Configuration management | Yes | Have | Kubernetes manifests and application config are version-controlled alongside code (`../change-management-policy.md`) |
| A.8.10 Information deletion | Yes | Have | `../data-retention-and-disposal-policy.md` — deletion at application layer plus backup rotation; GDPR erasure via `MemberEraser` |
| A.8.11 Data masking | Yes | Partial | Staging uses its own isolated database and Stripe test-mode keys rather than masked production data (`../change-management-policy.md`); no field-level masking/anonymization applied within production itself |
| A.8.12 Data leakage prevention | Yes | Partial | Signed, short-lived Spaces URLs and no public bucket listing (`../information-security-policy.md`) provide baseline exfiltration control; no dedicated DLP tooling |
| A.8.13 Information backup | Yes | Have | Daily managed PostgreSQL backups, 30-day retention (`../business-continuity-and-dr.md`) |
| A.8.14 Redundancy of information processing facilities | Yes | Gap | Single-node Kubernetes cluster, no multi-node failover — documented, accepted risk with a remediation plan in `../business-continuity-and-dr.md` and `risk-treatment-plan.md` |
| A.8.15 Logging | Yes | Have | `ActivityLog` captures security-relevant application events (`../information-security-policy.md`) |
| A.8.16 Monitoring activities | Yes | Gap | No error-monitoring/alerting tool (e.g. Sentry, uptime monitor) wired in; incidents are currently detected via audit-log review or user report — see `risk-treatment-plan.md` |
| A.8.17 Clock synchronization | Yes | Have | DigitalOcean managed infrastructure (managed PostgreSQL, Kubernetes nodes) provides standard NTP-synced system clocks |
| A.8.18 Use of privileged utility programs | Yes | Have | Privileged infrastructure actions require individual, approved access (`../access-control-policy.md`); no generic/shared privileged tooling |
| A.8.19 Installation of software on operational systems | Yes | Have | Deploys are exclusively through the CI/CD and container-image pipeline (`../change-management-policy.md`); no ad hoc manual software installation on production nodes |
| A.8.20 Networks security | Yes | Have | TLS via cert-manager on the cluster ingress; DigitalOcean managed VPC networking for the database and cluster |
| A.8.21 Security of network services | Yes | Have | Ingress-only exposure to the cluster; managed PostgreSQL is not directly internet-exposed |
| A.8.22 Segregation of networks | Yes | Partial | Production and staging use fully separate databases/secrets/namespaces (`../change-management-policy.md`); pod anti-affinity segregates web-traffic pods from secure-core workloads at the node level, but this is infrastructure-level segregation, not a formally documented network-segmentation policy |
| A.8.23 Web filtering | No | N/A | Not applicable — GymFlyte does not provide or manage end-user internet browsing; this control targets outbound browsing protection for an organization's own workforce, handled at the OS/endpoint level rather than as a product control |
| A.8.24 Use of cryptography | Yes | Have | TLS in transit everywhere (`../information-security-policy.md`); Sanctum session cookies HttpOnly/Secure; no plaintext HTTP accepted in production |
| A.8.25 Secure development life cycle | Yes | Have | Mandatory PR review, CI test workflows, staging validation before production (`../change-management-policy.md`) |
| A.8.26 Application security requirements | Yes | Partial | Security implications are part of mandatory code review (`../change-management-policy.md`); no separate, formal application-security-requirements checklist per feature yet |
| A.8.27 Secure system architecture and engineering principles | Yes | Have | Least-privilege RBAC, signed URLs, session-based auth, and TLS-everywhere reflect deliberate secure-by-design choices documented across the policy pack |
| A.8.28 Secure coding | Yes | Partial | Code review is the primary secure-coding control (`../change-management-policy.md`); no automated static-analysis/SAST tooling in CI yet |
| A.8.29 Security testing in development and acceptance | Yes | Partial | GitHub Actions test workflows exist for both repos (Pest backend, Vitest frontend) and are run at minimum manually pre-merge; not yet the enforced automated merge gate pending Actions minutes being enabled (matches the "Have (dormant)" status for this control in `../iso-27001-27701-readiness.md`) |
| A.8.30 Outsourced development | No | N/A | All GymFlyte development is performed by UBQ Solutions FZ-LLC's own engineers and contractors under standard confidentiality terms (A.6.6); no third-party development house is used |
| A.8.31 Separation of development, test and production environments | Yes | Have | Isolated staging namespace with its own database and secrets, separate from production (`../change-management-policy.md`) |
| A.8.32 Change management | Yes | Have | Version control, mandatory PR review, staging validation, rolling zero-downtime deploys, documented rollback (`../change-management-policy.md`) |
| A.8.33 Test information | Yes | Have | Staging uses its own isolated database and Stripe test-mode keys, never production data or secrets (`../change-management-policy.md`) |
| A.8.34 Protection of information systems during audit testing | Yes | Have | No production ISMS audit testing has been performed against live systems yet; when a certification-body audit occurs, evidence sampling will be scoped to avoid disruptive live testing against the production environment, consistent with the standard's intent |

## Summary

93 of 93 Annex A:2022 controls are addressed above; 89 are judged applicable to GymFlyte's ISMS
(3 marked not applicable with justification: A.7.6, A.8.23, A.8.30) and 4 physical controls are
applicable but fully inherited from DigitalOcean. Gaps are consistent with
`../iso-27001-27701-readiness.md`: MFA on admin/owner accounts (A.8.5), monitoring/alerting
(A.8.16), and high availability/redundancy (A.8.14) are the three highest-priority open gaps,
with backup-restore testing readiness (A.5.30) tracked as Partial. See `risk-treatment-plan.md`
for treatment decisions and owners.

## Roles & Responsibilities

- **Founder & CTO, UBQ Solutions FZ-LLC**: owns this Statement of Applicability, approves each
  control's applicability judgement, and is accountable for moving Partial/Gap controls toward
  Have.

## Review Cadence

Reviewed **annually**, and whenever the risk assessment, ISMS scope, or underlying control
implementation changes materially. Owned by **Founder & CTO, UBQ Solutions FZ-LLC**.
