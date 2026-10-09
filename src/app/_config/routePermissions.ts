export const ROUTE_PERMISSIONS: { pattern: RegExp, permissions: string[], restrictAll?: boolean, module?: string }[] = [

/* Admin Modules ----------------------------- */

/* activityLogs */
{ pattern: /^\/admin\/activityLogs$/, permissions: ['view logs'] },
{ pattern: /^\/admin\/activityLogs\/\d+$/, permissions: ['view logs'] },

/* archive (trash) — Super-Admin-only, gated by the admin shell itself */
{ pattern: /^\/admin\/archive$/, permissions: [] },

/* companies */
{ pattern: /^\/admin\/companies$/, permissions: ['view companies'] },
{ pattern: /^\/admin\/companies\/add$/, permissions: ['create companies'] },
{ pattern: /^\/admin\/companies\/\d+$/, permissions: ['view companies'] },
{ pattern: /^\/admin\/companies\/\d+\/edit$/, permissions: ['update companies'] },

/* demo tenants (platform admin) */
{ pattern: /^\/admin\/demoTenants$/, permissions: ['create demo tenants', 'delete demo tenants'] },
{ pattern: /^\/admin\/demoTenants\/add$/, permissions: ['create demo tenants'] },
{ pattern: /^\/admin\/demoTenants\/bulk$/, permissions: ['create demo tenants'] },

/* gymSignups */
{ pattern: /^\/admin\/gymSignups$/, permissions: ['view signups'] },
{ pattern: /^\/admin\/gymSignups\/\d+$/, permissions: ['view signups'] },
{ pattern: /^\/admin\/gymSignups\/\d+\/edit$/, permissions: ['update signups'] },

/* permissions */
{ pattern: /^\/admin\/permissions$/, permissions: ['view permissions'] },
{ pattern: /^\/admin\/permissions\/add$/, permissions: ['create permissions'] },
{ pattern: /^\/admin\/permissions\/\d+$/, permissions: ['view permissions'] },
{ pattern: /^\/admin\/permissions\/\d+\/edit$/, permissions: ['update permissions'] },

/* referrals */
{ pattern: /^\/admin\/referrals$/, permissions: ['view referrals'] },
{ pattern: /^\/admin\/referrals\/add$/, permissions: ['create referrals'] },
{ pattern: /^\/admin\/referrals\/\d+$/, permissions: ['view referrals'] },
{ pattern: /^\/admin\/referrals\/\d+\/edit$/, permissions: ['update referrals'] },

/* systemPlans */
{ pattern: /^\/admin\/systemPlans$/, permissions: ['view system plans'] },
{ pattern: /^\/admin\/systemPlans\/add$/, permissions: ['create system plans'] },
{ pattern: /^\/admin\/systemPlans\/\d+$/, permissions: ['view system plans'] },
{ pattern: /^\/admin\/systemPlans\/\d+\/edit$/, permissions: ['update system plans'] },

/* systemAddons */
{ pattern: /^\/admin\/systemAddons$/, permissions: ['view system addons'] },
{ pattern: /^\/admin\/systemAddons\/add$/, permissions: ['create system addons'] },
{ pattern: /^\/admin\/systemAddons\/\d+$/, permissions: ['view system addons'] },
{ pattern: /^\/admin\/systemAddons\/\d+\/edit$/, permissions: ['update system addons'] },

/* subscriptions (platform admin) */
{ pattern: /^\/admin\/subscriptions$/, permissions: ['view subscriptions'] },
{ pattern: /^\/admin\/subscriptions\/add$/, permissions: ['update subscriptions'] },
{ pattern: /^\/admin\/subscriptions\/\d+$/, permissions: ['view subscriptions'] },

/* tenant switcher (platform admin) — gated by the Super Admin admin shell */
{ pattern: /^\/admin\/tenants$/, permissions: [] },

/* users */
{ pattern: /^\/admin\/users$/, permissions: ['view users'] },
{ pattern: /^\/admin\/users\/add$/, permissions: ['create users'] },
{ pattern: /^\/admin\/users\/\d+$/, permissions: ['view users'] },
{ pattern: /^\/admin\/users\/\d+\/edit$/, permissions: ['update users'] },

/* Tenant Modules ----------------------------- */

/* applications */
{ pattern: /^\/applications$/, permissions: ['view applications'] },
{ pattern: /^\/applications\/\d+$/, permissions: ['view applications'] },
{ pattern: /^\/applications\/\d+\/edit$/, permissions: ['approve applications'] },

/* billing (gym owner) */
{ pattern: /^\/billing$/, permissions: ['view billing'] },

/* translations (gym owner — custom UI strings) */
{ pattern: /^\/translations$/, permissions: ['manage translations'] },

/* dashboard cards (gym owner — per-role dashboard config) */
{ pattern: /^\/dashboardCards$/, permissions: ['manage dashboard cards'] },

/* reports access (gym owner — per-role report config) */
{ pattern: /^\/reportsAccess$/, permissions: ['manage reports'] },

/* sidebar access (gym owner — per-role nav visibility) */
{ pattern: /^\/sidebarAccess$/, permissions: ['manage sidebar'] },

/* reports */
{ pattern: /^\/expiringMemberships$/, permissions: ['view expiring memberships report'] },
{ pattern: /^\/attendanceReport$/, permissions: ['view attendance report'] },
{ pattern: /^\/revenueSummary$/, permissions: ['view revenue report'], module: 'reports'},
{ pattern: /^\/lowStock$/, permissions: ['view low stock report'], module: 'pos'},
{ pattern: /^\/refundsReport$/, permissions: ['view refunds report'], module: 'pos'},

/* branch_settings */
{ pattern: /^\/branch_settings$/, permissions: ['branch settings'] },

/* branches */
{ pattern: /^\/branches$/, permissions: ['view branches'] },
{ pattern: /^\/branches\/add$/, permissions: ['create branches'] },
{ pattern: /^\/branches\/\d+$/, permissions: ['view branches'] },
{ pattern: /^\/branches\/\d+\/edit$/, permissions: ['update branches'] },

/* calendar */
{ pattern: /^\/calendar$/, permissions: ['view sessions'] },

/* classes */
{ pattern: /^\/classes$/, permissions: ['view classes'] },
{ pattern: /^\/classes\/inactive$/, permissions: ['view classes'] },
{ pattern: /^\/classes\/add$/, permissions: ['create classes'] },
{ pattern: /^\/classes\/\d+$/, permissions: ['view classes'] },
{ pattern: /^\/classes\/\d+\/edit$/, permissions: ['update classes'] },

/* dailySales */
{ pattern: /^\/dailySales$/, permissions: ['view daily sales report'], module: 'pos'},

/* duePaymentsReport */
{ pattern: /^\/duePaymentsReport$/, permissions: ['view upcoming billing report'], module: 'reports'},

/* import */
{ pattern: /^\/import\/members$/, permissions: ['import members'] },
{ pattern: /^\/import\/plans$/, permissions: ['import plans'] },
{ pattern: /^\/import\/suppliers$/, permissions: ['import suppliers'] },
{ pattern: /^\/import\/categories$/, permissions: ['import categories'] },
{ pattern: /^\/import\/products$/, permissions: ['import products'] },
{ pattern: /^\/import\/classes$/, permissions: ['import classes'] },
{ pattern: /^\/import\/staff$/, permissions: ['import staff'] },

/* inventories */
{ pattern: /^\/inventories$/, permissions: ['view inventories'], module: 'pos'},

/* memberPlans */
{ pattern: /^\/memberPlans$/, permissions: ['view memberPlans'] },
{ pattern: /^\/memberPlans\/add$/, permissions: ['subscribe memberPlans'] },
{ pattern: /^\/memberPlans\/\d+$/, permissions: ['view memberPlans'] },

/* members */
{ pattern: /^\/members$/, permissions: ['view members'] },
{ pattern: /^\/members\/add$/, permissions: ['create members'] },
{ pattern: /^\/members\/\d+$/, permissions: ['view members'] },
{ pattern: /^\/members\/add\/quick$/, permissions: ['create members', 'create memberPlans'], restrictAll: true },

/* plans */
{ pattern: /^\/plans$/, permissions: ['view plans'] },
{ pattern: /^\/plans\/add$/, permissions: ['create plans'] },
{ pattern: /^\/plans\/\d+$/, permissions: ['view plans'] },
{ pattern: /^\/plans\/\d+\/edit$/, permissions: ['update plans'] },

/* pos-registers */
{ pattern: /^\/pos-registers$/, permissions: ['view pos registers'], module: 'pos'},
{ pattern: /^\/pos-registers\/add$/, permissions: ['create pos registers'], module: 'pos'},
{ pattern: /^\/pos-registers\/\d+$/, permissions: ['view pos registers'], module: 'pos'},
{ pattern: /^\/pos-registers\/\d+\/edit$/, permissions: ['update pos registers'], module: 'pos'},

/* pos-sessions */
{ pattern: /^\/pos-sessions$/, permissions: ['view pos sessions'], module: 'pos'},
{ pattern: /^\/pos-sessions\/\d+$/, permissions: ['view pos sessions'], module: 'pos'},

/* productCategories */
{ pattern: /^\/productCategories$/, permissions: ['view categories'], module: 'pos'},
{ pattern: /^\/productCategories\/add$/, permissions: ['create categories'], module: 'pos'},
{ pattern: /^\/productCategories\/\d+$/, permissions: ['view categories'], module: 'pos'},
{ pattern: /^\/productCategories\/\d+\/edit$/, permissions: ['update categories'], module: 'pos'},

/* products */
{ pattern: /^\/products$/, permissions: ['view products'], module: 'pos'},
{ pattern: /^\/products\/add$/, permissions: ['create products'], module: 'pos'},
{ pattern: /^\/products\/\d+$/, permissions: ['view products'], module: 'pos'},
{ pattern: /^\/products\/\d+\/edit$/, permissions: ['update products'], module: 'pos'},

/* purchaseOrders */
{ pattern: /^\/purchaseOrders$/, permissions: ['view purchases'], module: 'pos'},
{ pattern: /^\/purchaseOrders\/add$/, permissions: ['create purchases'], module: 'pos'},
{ pattern: /^\/purchaseOrders\/\d+$/, permissions: ['view purchases'], module: 'pos'},

/* refunds */
{ pattern: /^\/refunds$/, permissions: ['view refunds'], module: 'pos'},

/* rolePermissions */
{ pattern: /^\/rolePermissions$/, permissions: ['view rolePermissions'] },
{ pattern: /^\/rolePermissions\/add$/, permissions: ['create rolePermissions'] },
{ pattern: /^\/rolePermissions\/\d+$/, permissions: ['view rolePermissions'] },

/* roles */
{ pattern: /^\/roles$/, permissions: ['view roles'] },
{ pattern: /^\/roles\/add$/, permissions: ['create roles'] },
{ pattern: /^\/roles\/\d+$/, permissions: ['view roles'] },
{ pattern: /^\/roles\/\d+\/edit$/, permissions: ['update roles'] },

/* sales */
{ pattern: /^\/sales$/, permissions: ['view sales'], module: 'pos'},
{ pattern: /^\/sales\/add$/, permissions: ['create sales'], module: 'pos'},
{ pattern: /^\/sales\/\d+$/, permissions: ['view sales'], module: 'pos'},

/* scanner */
{ pattern: /^\/scanner$/, permissions: ['scanner'] },

/* staff */
{ pattern: /^\/staff$/, permissions: ['view staff'] },
{ pattern: /^\/staff\/add$/, permissions: ['create staff'] },
{ pattern: /^\/staff\/\d+$/, permissions: ['view staff'] },
{ pattern: /^\/staff\/\d+\/edit$/, permissions: ['update staff'] },

/* stocktakes */
{ pattern: /^\/stocktakes$/, permissions: ['view stocktakes'], module: 'pos'},
{ pattern: /^\/stocktakes\/\d+$/, permissions: ['view stocktakes'], module: 'pos'},

/* subscriptionTransactions */
{ pattern: /^\/subscriptionTransactions$/, permissions: ['view daily subscriptions report'], module: 'reports'},

/* suppliers */
{ pattern: /^\/suppliers$/, permissions: ['view suppliers'], module: 'pos'},
{ pattern: /^\/suppliers\/add$/, permissions: ['create suppliers'], module: 'pos'},
{ pattern: /^\/suppliers\/\d+$/, permissions: ['view suppliers'], module: 'pos'},
{ pattern: /^\/suppliers\/\d+\/edit$/, permissions: ['update suppliers'], module: 'pos'},

/* workOrders */
{ pattern: /^\/workOrders$/, permissions: ['view work orders'] },
{ pattern: /^\/workOrders\/add$/, permissions: ['create work orders'] },
{ pattern: /^\/workOrders\/\d+$/, permissions: ['view work orders'] },

]