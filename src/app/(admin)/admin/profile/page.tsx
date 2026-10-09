// Super Admins have no tenant branch, so they can't reach the tenant-shell
// /profile (it requires a branch). Re-export the same profile page under the
// admin shell so account settings (name, email, password, photo, theme) stay
// reachable tenant-free. The member-payment section is guarded by
// `member_profile`, which a Super Admin never has, so nothing branch-scoped runs.
export { default } from "@/app/(app)/profile/page"
