import { atom, createStore } from "jotai"
import { atomWithStorage } from "jotai/utils"

const site = atom("IS Inventory")
const branch = atomWithStorage("branch", -1)
const company = atomWithStorage("company", -1)
const branch_settings = atomWithStorage<string[] | null>("branch_settings", null)
const requestCount = atom(0)
const loading = atom((get) => get(requestCount) > 0)
const responseMessage = atom<{type: "success" | "alert" | "error", text: string}>({type: null, text: null})
const validationErrors = atom<any>({})
const branchHashedId = atomWithStorage("branchHashedId", '')
const branchTermsAndConditions = atomWithStorage("branchTermsAndConditions", '')
const posRegister = atomWithStorage("posRegister", -1)
const activePosSession = atomWithStorage("activePosSession", -1)
// Name of the tenant a Super Admin has "entered" (drives the exit-to-admin
// banner in the tenant shell). Empty when not viewing a tenant as Super Admin.
const enteredTenantName = atomWithStorage("enteredTenantName", "")
// Member portal: branch_id of the gym membership the member is currently viewing.
// A person can be a member at several gyms at once, so gym-specific member pages
// (bookings, bills, purchases) scope to this. -1 = none selected yet. Persisted so
// a hard reload keeps the chosen gym instead of resetting the whole portal.
const activeMembership = atomWithStorage("activeMembership", -1)
// Member portal: share code of a gym reached by code (an UNLISTED gym the member
// isn't in yet). Proves reach to the signup endpoints (policy/subscribe/apply) that
// would otherwise 404. "" for directory / own gyms, which need no code. Persisted so
// it survives the Stripe redirect back into a code-based subscription.
const activeBranchCode = atomWithStorage("activeBranchCode", "")
const sidebarCollapsed = atomWithStorage("sidebarCollapsed", false)
// BaseTable page size per tableController (in-memory: survives navigation, not reload).
const baseTablePerPage = atom<Record<string, number>>({})
// Display name of the entity a view/edit page is currently showing, so the
// breadcrumb can render "Members > John Doe" instead of a generic "Details"
// for the id segment. Set via useBreadcrumbLabel; empty on list/non-entity pages.
const breadcrumbLabel = atom("")
const appTheme = atomWithStorage<"gymFlyte" | "gymFlyteDark">("appTheme", "gymFlyte")
const store = createStore()

const resetAppState = atom(
  null,
  (get, set) => {
    set(branch, -1)
    set(company, -1)
    set(branch_settings, null)
    set(requestCount, 0)
    set(responseMessage, {type: null, text: null})
    set(validationErrors, {})
    set(branchHashedId, '')
    set(branchTermsAndConditions, '')
    set(posRegister, -1)
    set(activePosSession, -1)
    set(enteredTenantName, "")
    set(activeMembership, -1)
    set(activeBranchCode, "")
  }
)

export {
	site,
	branch,
	company,
	branch_settings,
	requestCount,
	loading,
	responseMessage,
	validationErrors,
    branchHashedId,
    branchTermsAndConditions,
    posRegister,
    activePosSession,
    enteredTenantName,
    activeMembership,
    activeBranchCode,
    sidebarCollapsed,
    appTheme,
    baseTablePerPage,
    breadcrumbLabel,
	store,
    resetAppState
}