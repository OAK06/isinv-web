// Reuse the shared account-settings page (name, email, password, photo, theme,
// locale) under the member shell. Its member-payment section is guarded by
// `member_profile`, which is only populated with a selected branch — degrades to
// hidden in the tenant-free member portal, the rest works. A dedicated
// member-scoped payment-methods section arrives with the billing phase.
export { default } from "@/app/(app)/profile/page"
