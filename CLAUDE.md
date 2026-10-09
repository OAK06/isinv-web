# GymFlyte — Maintenance Context (post-redesign)

> Compact working doc for Claude. The 2026-06 redesign of the public site, auth pages, app
> shell, and ALL (app) system pages is COMPLETE (summary at bottom). Read this before
> touching the codebase; trust it over fresh exploration.

## Hard rules (from Omar — do not violate)
1. Colors ONLY via the daisyUI themes in `tailwind.config.js` (`gymFlyte` light,
   `gymFlyteDark`). Never arbitrary hex utilities (`bg-[#...]`). Never edit light-theme
   values. Hardcoded grays → base tokens (`bg-base-200`, `text-base-content/60`...).
2. Orange `accent` (#fd722b) only in small doses (badges, highlights) — never big fills.
   CTAs: `btn-primary` on light bg, `btn-secondary` on colored/photo bg.
3. RTL first-class: `ms/me/ps/pe-*`, `start/end`, `rtl:rotate-180` on directional icons.
   Never ml/mr/pl/pr/left/right for layout.
4. Every UI string via `t()`, keys in ALL 6 locales (en/ar/de/fr/nl/ja — ja added with
   the geo-locale work, full parity verified 2026-07-04). Edit locale JSONs via python
   json round-trip (indent=2, ensure_ascii=False, newline='\n', trailing \n).
5. Icons: FontAwesome SVG only. NOTE: `fas fa-*` CSS classes render NOTHING here.
6. No `yarn build` (Omar tests with yarn dev; he also declined preview_start once).
   Run `npx tsc --noEmit` after each batch — baseline 0 errors, keep it.
7. Modals always centered (`modal-middle` / default daisyUI modal).
8. Give honest recommendations over blind obedience; implement reversible in-scope work
   without asking. Don't commit unless asked.
9. Marketing redesign calibration (iterated 3× with Omar, 2026-07): keep GymFlyte's
   IDENTITY — the photo hero (bannerBG/FG.webp, single Request Demo CTA, py-12,
   don't touch it further), product images (mobileFriendly/memberPortal.webp), theme
   colors, copy. Within that, UBQ-quality finish is WANTED (he called UBQ "so much
   better"): section eyebrows, dark `bg-secondary` footer w/ inverted logo, big
   section h2s (`text-3xl md:text-5xl`), `py-20 md:py-24` alternating base-100/200
   rhythm, card hover lift + 120ms staggered fade-ins, rounded-2xl icon tiles that
   fill primary on hover, glass banner card w/ 2-col feature mini-cards, primary/10
   glows behind product images, final CTA w/ blobs + View Pricing outline button.
   Never replace his imagery with code-built mockups (round 1, firmly rejected);
   don't be so timid it changes nothing (round 2, "stuck too hard to branding").
   Language switcher: globe dropdown (desktop) / `inline` collapsible variant in the
   mobile drawer; same cookie+profile logic as the old select.
   Applied across ALL public pages 2026-07-04: homepage (hero got a glass badge pill +
   accent pulse dot + trust note under the CTA — keys heroBadge/heroNote), the 6
   feature pages (eyebrow via mainNavbar key, h1 `text-3xl md:text-5xl`, readable
   `text-base-content/70` paragraphs replacing bold+justified, glow+drop-shadow behind
   every screenshot, rounded-full CTAs, closing rounded-3xl bg-primary CTA band reusing
   mainPage.finalCta* keys), shared Questions FAQ (card-style collapses, primary
   numbers), and pricing (eyebrow + big h1, ring-primary highlight card w/ accent
   badge pill replacing the rotated warning ribbon, outline buttons on non-featured
   plans; geo/currency logic untouched). Feature pages are server components — no
   scroll-fade hooks there by design.

## Architecture (verified)
- Next 14 App Router; (app) pages all client; Tailwind 3 + daisyUI 3; loose TS (any).
- Page templates: list (`getList` + `<Header>` + `<BaseTable>`), add/edit (uncontrolled
  FormData + `validateForm` + jotai `validationErrors` + `<InputError>`), view pages.
  API wrappers in sibling `_<entity>.ts` (axios; don't change API contracts).
- Jotai globalStore: branch, company, posRegister, sidebarCollapsed,
  appTheme ('gymFlyte'|'gymFlyteDark', persisted), requestCount→LoadingBar,
  responseMessage→MessageModal, validationErrors.
- axios interceptors (src/lib/axios.tsx): requestCount skips `X-Form-Request` (forms) and
  `X-SWR-Request` (silent — also skips error toasts). Errors i18n'd via `apiErrors.*`.
- BaseTable contract: `data` = Laravel paginator ({data, current_page, per_page, total,
  last_page, filters?, visible_columns?}); row col 0 = id (skipped); colHeaderNames maps
  labels; filters/columns persist via users/_user saveFilters keyed by tableController.
  Features: skeleton when `data.data === undefined`, sticky thead in `overflow-auto
  max-h-[70vh]`, wheel→horizontal scroll (non-passive listener; only when no vertical
  overflow), useConfirm delete/bulk confirmations (archive variants), `emptyAction` prop.

## Gotchas / quirks (cost real debugging — don't re-learn)
- Sticky positioning dies inside any overflow!=visible ancestor. App layout uses
  `overflow-x-clip` (NOT auto) on drawer root + `min-w-0` on content column/main so wide
  tables scroll internally and the sticky navbar survives. Don't add overflow-x-auto back.
- `overflow-x-auto` forces overflow-y:auto → phantom scrollbar on Windows (breadcrumb
  wraps via flex-wrap instead).
- FontAwesome CSS loads after Tailwind: `lg:hidden` directly on an FA svg loses — wrap
  icon in a span and hide the span (sidebar chevrons do this).
- choose-branch auto-redirect relies on roles being BRANCH-SCOPED (empty until branch
  picked; resetState() on mount). Navbar "Switch Branch" depends on it. Don't simplify.
- Misspelled-but-load-bearing locale keys: `branchSettings.stripeConnectionFaild`,
  `urls.SessionsUrl` (capital S) — code matches these spellings.
- Dynamic t() lookups grep can't see: ALL top-level no-dot keys (t(status_name),
  t(plan.duration)), `breadcrumb.*`, `mainPage.card${i}*`, `pricing.plan${n}.*`,
  `${page}questions.question${n}.*`. Never remove these families.
- `breadcrumb.*` is keyed off the RAW URL PATH SEGMENT (`breadcrumb.tsx` does
  `t('breadcrumb.'+path, {defaultValue: path})`), completely separate from any page's
  own i18n namespace — adding a new top-level route WITHOUT its own `breadcrumb.<route>`
  key silently falls back to the raw camelCase segment untranslated (found + fixed
  2026-07-20 for `demoTenants`/`subscriptions`/`systemAddons`, all missing since the
  platform-billing feature shipped). **Checklist for every new top-level `(app)` route:
  add its `breadcrumb.<segment>` key in all 6 locales**, not just the page's own
  `<feature>.listTitle` etc.
- Locale edits: json.load keeps last duplicate silently — parity verified 5×5 as of
  2026-06-12; re-run a flatten-diff after bulk edits.
- App layout redirects live in useEffect (never render-phase router.push).
- Theme scoping: dark theme applies via `document.body.dataset.theme` effect in
  (app)/layout (covers ModalPortal→body portals; cleanup keeps public/auth light).
- ApexCharts don't inherit CSS vars — charts read appTheme atom for foreColor/grid/
  tooltip (effects re-run on [isDark]).
- Form grids: 2-col with full-width (`lg:col-span-2`) only after complete pairs,
  else visual gaps. All forms normalized; keep the rule for new fields.
- Batch edits: python with `assert old in src` per replacement, write newline='\n'
  (mixed tabs/spaces per file). A failed assert mid-script = nothing written (write
  happens at end) — but beware multi-file scripts that write per-file as they go.

## Dark theme decisions (iterated with Omar)
- Surfaces NEUTRAL grays (he rejected navy-tinted): base-100 #262626, base-200 #171717,
  base-300/neutral #404040, secondary/sidebar #0f0f0f (must stay darker than base-200).
- primary = exact brand #0284c7 (rejected brighter #0ea5e9). accent unchanged.
- Watch: text-primary on dark cards ≈3:1 contrast — if Omar says links look dim, lift
  TEXT usage only, not the brand color.
- Preference persists server-side: GET/POST `/api/user/theme` (silent X-SWR-Request) in
  profile/_profile.ts; layout fetches once per session (useRef guard), toggle saves
  optimistically; all failures silent. **Backend contract (Omar implements): GET ->
  { response: { theme: "light"|"dark" } }; POST { theme }.**

## SEO / AI discoverability (2026-07-04, mirrors the UBQ setup)
- `public/llms.txt` — product/features/pricing summary for AI answer engines.
  **Update it when features, prices ($99/$549/$999 USD base) or pages change.**
- robots.ts: allowlist (marketing pages only — app stays blocked) + explicit AI
  crawler rules (GPTBot, ClaudeBot, PerplexityBot, …) sharing the same allowlist.
- JSON-LD: Organization+WebSite site-wide in layout.tsx (@id-linked);
  SoftwareApplication on homepage (featureList + AggregateOffer importing
  BASE_PLANS from pricing/_pricing.ts so prices can't drift); BreadcrumbList via
  `(public)/_components/breadcrumbJsonLd.tsx` on the 6 feature pages + pricing;
  FAQPage already emitted by the shared Questions component.
- owner-signup: metadata lives in `(public)/owner-signup/layout.tsx` (page is a
  client component) using new `ownerSignup.meta.*` keys (×6).
- Same known limitation as UBQ: single-URL i18n → no hreflang; Google indexes one
  language per URL. Fixing needs per-locale routes; decided against for now.

## Self-onboarding + addons + billing (2026-07-19) — frontend side
- Public: `/get-started` 3-step wizard ((public)/get-started — server page resolves geo pricing
  like /pricing incl. FX fallback, client `_components/getStartedWizard.tsx`; submits slugs-only
  JSON to `POST /api/public/onboard` after `/sanctum/csrf-cookie`; trial → hard redirect
  /dashboard (session already set), paid → Stripe checkout_url). Pricing page: primary CTA now
  "Start free trial" → /get-started, secondary "book a demo" link kept; addons section shows
  `addons.{slug}.title/description` w/ geo monthly price. Public system-plans response shape
  CHANGED to `{plans, addons}` (`_pricing.ts getSystemPlans` returns that object now).
- App: `/billing` owner page (perm `view billing`; plan/status/checkout, addon toggles →
  `/api/billing/addons`, trial-limits usage table, payment history; handles
  `?platform_payment=success|canceled` return). `subscriptionBanner.tsx` in app layout (trial
  countdown / past-due). Lock: layout redirects owners to /billing and shows staff a LockNotice
  when subscription.status ∈ {pastDue, suspended} (Super Admin exempt). Navbar shows a "Demo"
  badge when `user.is_demo`.
- Module gating: `routePermissions.ts` entries have optional `module?: 'pos'|'reports'` (typed
  now); `guard.tsx` checks `user.modules`; sidebar POS group + report items get `locked` flag →
  lock icon linking to /billing (upsell, not hidden). `user.modules`/`user.subscription`/
  `user.is_demo` come from UserResource keyed to the `?branch=` param.
- Admin pages: `systemAddons/*` (clone of systemPlans w/ monthly price grid), `subscriptions/*`
  (list/add/manage w/ mark-paid), `demoTenants/add` (salesperson name → seeded demo account,
  shows credentials), `demoTenants` (2026-07-20: list of DEMO companies ONLY + permanent delete,
  single AND bulk; perm `delete demo tenants`; standard BaseTable `deleteFunction` +
  `bulkDeleteFunction` (checkbox selection) — irreversible hard delete of the company and ALL
  its records incl. login accounts + Spaces files, done server-side by `CompanyEraser`. Backend
  `is_demo` guard is the real safety net so BaseTable's generic confirm suffices — no custom
  modal, BaseTable stays untouched). ONE sidebar entry `/demoTenants` (list, gated
  `create|delete demo tenants`) with Add via header button — like every other admin entity;
  `index` is create-or-delete gated, destructive actions delete-only. BASE_COUNTRIES (systemPlans/_systemPlan.ts) now includes `XX`
  "Default" row — REQUIRED for worldwide charging fallback; plans/addons forms must fill it.
- axios 400 handler now maps stable `code`s (demo_mode, trial_limit_reached, module_disabled →
  apiErrors.* keys) before falling back to raw message.
- i18n: new namespaces getStarted/billing/subscriptions/systemAddons/demoTenants/
  subscriptionBanner/subscriptionLock/addons + misc keys; full 6-locale parity re-verified
  (also patched 23 PRE-EXISTING ja gaps in memberPlans/memberSessions/sessionFilters).
- llms.txt updated (trial, addons, /get-started page).

## Post-login redirect chain smoothed (2026-07-20)
Was login -> /choose-branch -> /choose-pos-register -> /dashboard (3 page mounts even for
the single-branch/single-register case self-onboarding always produces). Now: `/choose-branch`
resolves the POS register inline too (0 or 1 register -> straight to /dashboard; only 2+
detours through `/choose-pos-register`, which still exists standalone for that case and for
the navbar's manual "Switch POS Register" mid-session). All AUTOMATIC (effect-driven, not
user-click) redirects across this chain (`useAuth`'s guest-middleware redirect, AppLayout's
needsBranch/needsPosRegister/billing-lock redirects, both choose-* pages' auto-resolve
effects) switched from `router.push` to `router.replace` so the back button can't land on an
intermediate resolver page that just bounces forward again. Manual form submits (picking a
branch/register when there ARE multiple) still use `push` — deliberate navigation, unchanged.

## Super Admin revamp — Phase 2 / FRONTEND (2026-07-20)
Backend Phase 1 (global tenant-independent Super Admin role, `/api/admin/tenants`, bulk demo
create, no-branch `/api/user`) shipped on the backend branch first; this is the frontend on its
own branch. Goal: Super Admin logs in with NO tenant, lands in a dedicated admin dashboard, and
can ENTER any tenant to act with full powers — no more admin/tenant surface overlap.
- **New `src/app/(admin)/` route group** = the Super-Admin-only shell: own `layout.tsx`
  (guards on `roles.includes('Super Admin')`, else → /dashboard; NO branch/POS context needed),
  `_components/adminSidebar.tsx` (flat platform-mgmt nav), and `admin/dashboard/page.tsx` landing
  (quick-link cards). URLs are `/admin/*` (a real `admin` folder inside the `(admin)` group).
- **The 10 admin entity folders MOVED** `(app)/<e>` → `(admin)/admin/<e>` (companies, users,
  permissions, gymSignups, activityLogs, referrals, systemPlans, systemAddons, subscriptions,
  demoTenants). Move done via `cp -r` + `rm -rf` because Windows blocks *directory renames* while
  the dev watcher holds handles (plain file cp/rm work). A script then rewrote, inside the moved
  tree only: self-import aliases `@/app/(app)/<e>/`→`@/app/(admin)/admin/<e>/` and quote/backtick-
  anchored route strings `"/<e>`→`"/admin/<e>` (anchored so `/api/<e>` and substrings are safe;
  `_<e>.ts` API wrappers hit `/api/*` and were untouched). `BaseTable` imported saveFilters/
  saveVisibleColumns from the moved `users/_user` — that ONE import was repointed (BaseTable logic
  untouched; the funcs are generic table-prefs that just happen to live there).
- **Removed the `admin` group from the tenant `sidebar.tsx`** (now in adminSidebar). `isSuperAdmin`
  still drives `hasPosAccess`; dropped the now-unused `faGear` import.
- **Tenant switcher** `/admin/tenants` (custom table, not BaseTable — the row action is "Enter",
  not view/edit/delete): searchable/paginated list from `GET /api/admin/tenants`; "Enter" sets the
  `branch`+`company` atoms (+ resets pos, sets `enteredTenantName`) and `router.push('/dashboard')`
  → the Super Admin drops into the NORMAL tenant shell with full powers (Gate::before authorizes any
  branch; tenant pages read the `branch` atom and pass it to their wrappers, so scoping just works).
  `branch_settings` is left null (optional tenant features render off while browsing as admin).
- **Exit banner**: new `(app)/_components/superAdminBanner.tsx`, rendered by the tenant `(app)`
  layout whenever `roles.includes('Super Admin')`. Shows "Viewing <tenant> as Super Admin" + Exit
  → `resetAppState()` (clears branch/company/pos/enteredTenantName) + `router.replace('/admin/dashboard')`.
  New atom `enteredTenantName` in globalStore (in `resetAppState`).
- **Login routing**: login still targets `/choose-branch`; that page now redirects a Super Admin
  (`roles.includes('Super Admin')`, they have no tenant branches) to `/admin/dashboard` before the
  POS-resolve effect. `(app)` layout's needsBranch → /choose-branch → /admin is the safety net.
- **Bulk demo tenants** `/admin/demoTenants/bulk` (count 1..50 + prefix → `POST /api/demo-tenants/
  bulk`, shows generated credentials table); a "Bulk create" button sits beside "Add" on the
  demoTenants list.
- **Navbar** got an `admin` prop (hides demo badge + switch-branch/POS, points logo + Profile to
  `/admin/*`). **Profile** is re-exported at `(admin)/admin/profile/page.tsx` (the profile page's
  only branch use is the member-payment section, guarded by `member_profile` which a Super Admin
  lacks — so it works tenant-free).
- **Breadcrumb** got an optional `homeHref` prop (admin layout passes `/admin/dashboard`);
  `(admin)/admin/page.tsx` redirects `/admin`→`/admin/dashboard` so the "admin" crumb resolves.
- **routePermissions.ts**: all 10 admin entity patterns re-prefixed to `/^\/admin\/…` (a script
  that left `subscriptionTransactions` — a tenant report — alone); added `/admin/demoTenants/bulk`
  + `/admin/tenants`. **i18n**: new `tenants.*`, `adminDashboard.*`, `superAdminBanner.*`,
  `demoTenants.bulk.*`, `sidebar.{adminDashboard,tenants}`, `breadcrumb.{admin,tenants,bulk}` — full
  6-locale parity re-verified (1879 keys each, 0 diff). tsc 0 source errors (the `.next/types`
  errors after the move are stale generated route-types for the OLD paths — cleared/regenerated;
  they're NOT source errors). NOT verified in a browser yet (same standing caveat as open item #3).

## Multi-vertical landing pages (2026-07-21)
GymFlyte now markets to more than gyms: swim schools, yoga/Pilates, martial arts, dance. Each
vertical gets its OWN tailored marketing landing on its OWN subdomain; the app itself is shared
and stays on the main domain. Decisions (locked with Omar): **marketing-only subdomains** (all
signup/login/app on `www` — so NO backend `SESSION_DOMAIN`/CORS/Stripe change), **parameterized
template** (not bespoke pages), verticals swim/yoga/dojo/dance + gym (+coach), and a **neutral
umbrella** brand on `www`.
- **Vertical resolution mirrors locale resolution** — read the `Host` header server-side, NO
  middleware (`src/app/(public)/_verticals/resolveVertical.ts`, same pattern as
  `i18n/resolveServerLocale.ts`). `swim.gymflyte.com`→`swim`; `www`/apex/unknown→`umbrella`.
  `?vertical=<slug>` query overrides for `yarn dev` preview without DNS.
- **Registry** `_verticals/config.ts`: per-vertical `{hosts, copyPrefix, heroImgAlt, images}` +
  `MAIN_URL`, `funnelHref(path,vertical,onMain)` (relative on umbrella/main, absolute
  `www…?vertical=` on a subdomain), `verticalUrl(slug)` (builds `https://<label>.<root>`).
  **`gym` copyPrefix=`mainPage` + existing gym images → gym landing renders byte-identical.**
- **The home route lives in a `(home)` route group** (`src/app/(home)/`): a `page.tsx` SERVER
  component dispatches on the resolved vertical to `_verticals/MarketingLanding.tsx` (the old
  homepage JSX, parameterized: only images + 4 hero keys `heroBadge/headlineMain/headlineSub/
  introHeading` read from `copyPrefix`, everything else stays `mainPage.*`) or
  `_verticals/UmbrellaLanding.tsx` (NEW neutral page: hero + "choose your studio" card grid +
  final CTA). Chrome (navbar/footer/edge-to-edge `<main className="overflow-hidden marketing">`)
  is rendered by `(home)/layout.tsx`, a **CLIENT** layout — NOT by the page/landings. The old
  `src/app/page.tsx` was deleted (moved into the group).
- **UPDATE (2026-07-22): the umbrella IS the www/apex landing again** (the earlier TEMP
  gym-fallback is reverted). `(home)/page.tsx` renders `<UmbrellaLanding/>` for `umbrella`;
  root `layout.tsx` metadata uses `verticals.umbrella.metaTitle`/`headlineSub`. **UmbrellaLanding
  was expanded from a thin hero+picker into a FULL marketing page** (hero → trust strip → value
  cards → feature banner → partners → mobile → portal → vertical picker → final CTA) because most
  visitors land on www first. It reuses the now-vertical-neutral `mainPage.*` copy + shared
  product images (`/mobileFriendly.webp`, `/memberPortal.webp`, `/bannerALT.webp`) — the section
  JSX is duplicated from `MarketingLanding.tsx` (deliberately, to avoid touching the liked
  vertical page; copy stays in sync via the shared i18n keys, structure could drift). New key
  `verticals.umbrella.introHeading` (×6). Hero still uses `/bannerBG.webp`.
- **⚠️ TWO hard-won gotchas fixing "Element type is invalid … got undefined" 500s (server-render
  only, tsc is clean either way):**
  1. **i18n must come from `react-i18next`, not `next-i18next`, in any component crossing a
     server→client boundary.** `next-i18next` is a pages-router lib; its `Trans` AND
     `useTranslation` resolve to `undefined` in the app-router client bundle when the render is
     entered from a server component (they work fine when the whole tree is client-rooted, which
     is why the rest of the app — all client pages/layouts — never hit this). The landings import
     `{ Trans, useTranslation } from "react-i18next"`.
  2. **`Navbar`/`Footer` (→ `LanguageSwitcher` → `_profile`/axios/i18n chain) must be rendered by
     a CLIENT layout, never directly by a server page** (even via a client wrapper child). Hence
     `(home)/layout.tsx` is `"use client"` and renders the chrome; the server `page.tsx` renders
     body only, arriving as `children`. This mirrors how `(public)/layout.tsx` works.
  Rule of thumb: a new SERVER page that needs the marketing chrome must put Navbar/Footer in a
  sibling client layout and keep i18n on `react-i18next`.
- **Navbar/footer** use `_verticals/useVertical.ts` (client hook, reads `window` after mount →
  no hydration mismatch) + `funnelHref` so login/get-started/owner-signup/pricing/feature links
  jump to `www` on a subdomain. Logo `/` stays on-subdomain.
- **SEO**: `layout.tsx generateMetadata` is vertical-aware (host-based; verticals derive
  title/desc from hero copy, umbrella uses `verticals.umbrella.metaTitle`). `sitemap.ts` adds
  each vertical subdomain landing. robots unchanged (already allows `/` + assets). `llms.txt`
  got a "Solutions by industry" section.
- **get-started** passes `?vertical` into the `/api/public/onboard` payload as an optional tag
  (backend ignores it until it opts to persist — no contract change yet).
- **i18n**: new `verticals.{swim,yoga,dojo,dance,umbrella}.*` block, authored + hand-
  translated in ALL 6 locales (0 parity diff). **RENAME (2026-07-22): the `martial-arts` slug/
  copyPrefix/i18n-key/image-folder were all renamed to `dojo`** (config `VerticalSlug`,
  `verticals.dojo.*`, `verticals.umbrella.pick.dojo`, `public/verticals/dojo/`) — the `dojo` host
  was already canonical so subdomain URLs/DNS/ingress are unchanged; `martialarts`/`martial-arts`/
  `ma` remain host aliases resolving to the `dojo` slug. tsc 0 errors.
- **Hero imagery (2026-07-21):** `heroFg` (the athlete cutout) is now OPTIONAL in `VerticalConfig`
  — `gym` keeps `bannerFG.webp` (two-column hero, unchanged); verticals have NO cutout and render
  a **full-bleed** hero (text centered over the background), MarketingLanding branches on
  `!!config.images.heroFg`. Each vertical's `heroBg` is at `public/verticals/<slug>/hero.webp`.
  **These are PROCEDURALLY-GENERATED brand placeholders** (navy base + orange diagonal brand
  wedge echoing `bannerBG` + a faint activity glyph via Segoe emoji) — NOT photos, because this
  env has no AI image generator (design skills' Gemini venv/key absent). Product screenshots
  (`mobileFriendly`/`memberPortal`) stay shared (`SHARED_PRODUCT_IMAGES`). To upgrade: drop a real
  1920×746 photo at the same `hero.webp` path (optionally brand-treat it to match bannerBG's
  blur+orange/navy wedge). Umbrella still uses `bannerBG.webp`.
- **v1 scope / phase-2**: subdomain serves its LANDING only (feature/pricing pages funnel to
  `www`); per-vertical brand COLOUR deferred (hard rule #1 — themes only); real vertical
  photography deferred (generated placeholders in place); backend `vertical`/`business_type`
  persistence deferred. NOT browser-verified (open item #3).
- **Deploy wiring (done in `GymFlyteBack/kube/`, applied 2026-07-21):** the single nginx
  ingress + cert-manager cert (per-host Let's Encrypt HTTP-01, `letsencrypt-cluster-issuer` —
  NOT wildcard) route both front and back. Added the 5 vertical subdomains
  `gym/swim/yoga/dojo/dance.gymflyte.com` → `gymflyte-front-service` (rules + `tls.hosts` in
  `ingress.yaml`, `dnsNames` in `certificate.yaml`). The dojo vertical's host is **`dojo`**
  (config.ts `dojo.hosts[0]`). No `SESSION_DOMAIN`/CORS change (marketing-only).
- **Omar prereq (DNS — do FIRST, before applying the cert or HTTP-01 fails):** add an A record
  for each of gym/swim/yoga/dojo/dance (or one `*.gymflyte.com` wildcard A record) → the same
  ingress LB IP as `www`. Then `kubectl apply` the cert + ingress (see the deploy runbook at the
  bottom of this section / the reply that shipped this).

## Coach (personal-trainer) vertical + solo edition (2026-07-22)
New `coach` vertical (`coach.gymflyte.com`, aliases `trainer`/`pt`) that signs trainers up into the
restricted **solo edition** (backend: see GymFlyteBack/CLAUDE.md "SOLO EDITION"). Frontend:
- `_verticals/config.ts`: `coach` vertical with `edition:'solo'` (new optional `edition` field on
  `VerticalConfig`), hosts `[coach,trainer,pt]`, its own `hero.webp` placeholder; new
  `editionForVertical(vertical)` helper. `UmbrellaLanding` VERTICAL_ICONS gained `coach: faStopwatch`.
- **Edition-aware pricing/get-started**: `getSystemPlans(country, edition)` forwards `?edition=solo`;
  `get-started/page.tsx` + `pricing/page.tsx` resolve edition from `?vertical` → show ONLY the solo
  `$19/$190` plans (+ no addons) for coach; standard everywhere else. Wizard needs no change (renders
  `pricing.<slug>.*`; new `pricing.solo-monthly/solo-yearly.*` keys added). Gating in the app is
  permission-driven (backend), so NO sidebar/routePermissions changes.
- i18n: `verticals.coach.*` + `verticals.umbrella.pick.coach.*` + `pricing.solo-*.*`, all 6 locales,
  parity re-verified (1957 keys). tsc 0. Coach landing dev-verified (200, hero+image+navbar).
- Infra (Omar): `coach.gymflyte.com` added to GymFlyteBack ingress + cert; needs a `coach` DNS A record.

### `/get-started` 500 — PRE-EXISTING boundary bug, now FIXED (2026-07-22)
`(public)/get-started/page.tsx` was a SERVER component rendering `<GetStartedWizard>` (a CLIENT
component importing `@/lib/axios` + `useAuth`) — the SAME server→client-axios boundary that 500'd
`Navbar` on the homepage ("element type is invalid"). Proven pre-existing (original 500'd too; NOT
the coach edits), so onboarding had been broken for every vertical since it shipped (never
browser-verified, open item #3). **Fix:** `get-started/page.tsx` is now a CLIENT page (`"use
client"`) that fetches plan data from a new server route handler
`src/app/api/onboarding-plans/route.ts` (does the internal-key `getSystemPlans` + geo + edition
resolution + FX fallback server-side) and renders the wizard with a daisyUI spinner while loading.
The wizard reads `?plan`/`?vertical` from the URL itself; metadata stays in the server
`get-started/layout.tsx`. Dev-verified: `/get-started` + `/get-started?vertical=coach` = 200.
**RULE (reiterated): never render an `@/lib/axios`-importing client component directly from a
server page** — make the page/parent client, or split the data fetch into a route handler.

## Testing (added 2026-08-23)
- **Vitest + jsdom** (only 2 devDeps — no Jest/RTL; nothing here renders components).
  `yarn test` (run once, CI-friendly), `yarn test:watch`. Colocated `src/**/*.test.ts`.
- **Import test globals from `"vitest"` explicitly** (no globals in tsconfig) — test files
  ARE type-checked by `npx tsc --noEmit`, keep the 0-error baseline. `tsconfig` has no
  `target`, so use `Array.from(set)` NOT `[...set]` in tests (spread-iterating a Set errors).
- Covered (364 tests / 67 files): `fileUrl`, `listParams` (one-shot carrier), `validateForm`
  (required/email/numeric + custom fields), `emailConflict` (fail-open), a representative
  entity wrapper (`_member` URL building), **6-locale key PARITY** (automates hard rule #4 —
  run `yarn test` after locale edits instead of the manual 5×5 flatten-diff; currently CLEAN),
  and the **axios interceptor** (`axios.test.ts`) — the richest target: drives the REAL
  configured instance through a swapped `defaults.adapter` and asserts store side-effects
  (requestCount net-zero on every status incl. the double-decrement guard, X-Form/X-SWR
  skips, 422 validationErrors incl. the never-undefined fallback, 400-code→i18n mapping,
  401→/login, 403 no-nav, BaseTable list-param injection + one-shot consumption).
- **Every one of the 60 `_<entity>.ts` wrappers has its OWN colocated `_<entity>.test.ts`**
  (each hand-builds its URL, so each can break independently). Standard harness: `vi.mock`
  `@/lib/axios` with a `vi.hoisted` recorder capturing `{method,url,headers}`, one `it` per
  exported request-builder asserting exact method+URL (+`X-Form-Request` where set), both
  branches of optional params (sort etc.). New wrappers MUST get one — copy `_branch.test.ts`.
  Non-standard cases handled: `_dashboard` (16-widget table loop), `_pricing` (`fetch`-based
  server-to-server `getSystemPlans` — asserts URL + `X-Internal-Key` present/absent + failure
  fallback; plus FX-math pure helpers), `_demoTenant`/`_sale` (axios `params` object → mock
  can't see the query string, assert base URL + header only).
- `apiWrappers.smoke.test.ts` ALSO sweeps all wrappers via `import.meta.glob` as a backstop
  (well-formed URL / no `undefined` / `?_method=PUT`⇒POST) — catches new wrappers even before
  someone writes their explicit test.
- Payment/Stripe flows are tested live, not here (Omar's call).
- Gotchas: installed with `yarn add -D --ignore-engines` (undici wants node ≥22.19, box has
  22.17 — runtime is fine). **Mocking a REJECTED axios call: route the rejection through a
  PLAIN function, not a `vi.fn`** — Vitest v4's spy settled-result tracking attaches a
  fulfill-only handler and false-flags a spy-returned rejection as "unhandled" (fails the test
  even though assertions pass). See `emailConflict.test.ts` for the pattern.

## Open items
1. **Backend for /api/user/theme** — Omar's side; frontend already tolerant of 404.
2. **Currency**: `$` hardcoded in sales/add, plansTab, members/add/quick. No currency
   field reaches the frontend anywhere (only public pricing config has regions). Needs
   backend field + Omar's direction.
3. **Visual pass**: NOTHING from the redesign has been verified in a browser yet.
   Highest-risk spots: sidebar collapse + accordion, sticky navbar, BaseTable (skeleton/
   sticky head/wheel scroll/confirms), dark mode (charts, modals, scanner), Arabic RTL.
4. Nothing committed (branch master, everything uncommitted). Offer chunked commits.
5. `public/branded-app/` (~4MB, 8 images) unused — wire up or delete when Omar decides.
6. staffDashboard/memberDashboard stubs exist but are unreachable (dashboard/page.tsx
   only branches owner vs generic card) — candidates for real features later.

## Deployment (reviewed & hardened 2026-06 — Omar's setup was mostly right)
- **Docker is standalone-based.** next.config.js `output: 'standalone'`. Builder stage:
  `yarn install --frozen-lockfile` + `yarn build` (yarn kept — its install speed still
  matters at build time; NEXT_PUBLIC_* are inlined here via .env.production.local built
  from ARGs BACKEND_URL/BASE_URL/TINY_KEY). Runner stage copies ONLY .next/standalone +
  .next/static + public, runs `node server.js`. Do NOT revert to `yarn start`/`next start`:
  standalone's entry point IS server.js (no full node_modules in runner), and plain `node`
  as PID1 gets SIGTERM directly → clean graceful shutdown on rolling deploys. Runner has a
  non-root `nextjs` user.
- **public MUST be copied to the runner** — server-side i18n (serverTranslation), sitemap,
  robots read `process.cwd()/public/locales` at runtime; standalone omits public by default.
  If translations 500 on first standalone deploy, this copy is the cause.
- `.dockerignore` excludes `.env`/`.env.*` except `.env.example` (the build needs it).
- **Kube deployment = BestEffort BY DELIBERATE CHOICE. Do NOT add resource requests/
  limits back.** Omar's model: the node is the budget; every pod grabs what it uses, he
  watches `kubectl top nodes` and upgrades the DigitalOcean node when tight. Reasoned
  through: requests reserve capacity that blocks OTHER pods from scheduling even when
  unused; limits previously OOMKilled pods mid-run. Both intentionally absent.
- `affinity.podAntiAffinity` (web-traffic avoids nodes running secure-core) is INTENTIONAL
  node segregation (public-facing vs secure projects on separate nodes). NEVER edit it.
- replicas: 1 + strategy maxUnavailable:0/maxSurge:1 = zero-downtime deploys at 1-replica
  cost (new pod ready before old removed). Readiness/liveness probes on `/` (readiness is
  what makes the rolling deploy actually safe — old pod stays until new answers). Non-root
  securityContext, revisionHistoryLimit 5.
- service.yaml now has `namespace: gymflyte` (was missing → bare apply landed in default ns
  and selected nothing). pipeline.ps1 applies deployment + service, checks docker push exit.
- image `:latest` in manifest; pipeline does `kubectl set image` to the versioned tag —
  left as-is (works; manifest just isn't the version source of truth).

## Done (don't redo, don't re-inspect)
Public site: SEO (metadata/sitemap/robots/JSON-LD), WebP images, navbar/footer rebuilt,
CTAs normalized, single-h1. Auth: forms fixed (ids/autocomplete/translations), card
layout. App shell: sticky navbar+LoadingBar, accordion sidebar (collapsible icon rail,
active states, logoMark.png collapsed logo), identity dropdown w/ branch+POS switching.
System pages: BaseTable fully modernized; Header subtitle; owner dashboard (KPI cards,
fallback card, chart fixes); member profile (tabs, dead-icon fix, default tab); calendar
(header/filters/keys/card); scanner (avatar fallback, RTL); sales POS polish; global
sweep (740 replacements: gray→tokens, physical→logical dirs, border-2→border+shadow);
form grid gaps fixed (6 forms); untranslated strings hunted (supplier view, Close×8,
language switcher, MessageModal, axios errors); 54 dead locale keys removed; 5-locale
parity (incl. 4 AR fixes); axios double-decrement bug fixed; breadcrumb modernized;
member signup flow + choose-* reviewed. tsc = 0 errors throughout.
Internal polish pass 2026-07-04 (post-marketing-redesign): auth layout got brand glow
blobs; ALL auth-shell forms upgraded input-sm→input and primary CTAs→full-size
rounded-full (login/register/forgot/reset/verify/choose-*/signature/member signup);
choose-* titles are real h1s; owner dashboard KPI cards got hover lift + icon tile
fill-on-hover + font-heading numbers; Loading spinner branded (loading-lg text-primary).
App shell (navbar/sidebar/BaseTable) deliberately untouched — June state is final.
Form-CTA sweep 2026-07-05 (after Omar's browser pass approved the design): page-level
form submit buttons across ALL (app) add/edit/settings/profile forms upgraded
btn-sm→full-size `btn btn-primary` (37 buttons, 36 files; quick-add step Next matched).
Kept btn-sm ON PURPOSE: header/list actions, BaseTable filter panel, modal submits
(w-fit variants), filter bars (memberSessions), inline table/scanner/POS buttons —
compact contexts. Rule: a page form's primary CTA is full-size; controls stay small.
Dashboard widgets built 2026-07-05: peak-hours card = CSS column chart (24h bars,
peak bar solid primary, daisyUI tooltips, dir=ltr; count field read defensively as
count??entries??total — CONFIRM real field name with backend, falls back to
subtitle-only when all zero); lead funnel = horizontal progress bars w/ stage-fading
opacity + noData empty states (ownerDashboard.peakHours/leadFunnel.noData ×6).
Both pure CSS tokens — no ApexCharts, so no appTheme plumbing needed.
