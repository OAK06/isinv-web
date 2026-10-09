"use client"

import { usePathname } from "next/navigation"
import { ROUTE_PERMISSIONS } from "@/app/_config/routePermissions"
import Loading from "@/app/(app)/_components/loading"
import NotFound from "@/app/not-found"

export default function Guard({user, children}: {user: any, children: React.ReactNode}) {
const pathname = usePathname()

if (!user?.permissions) return <Loading />

const route = ROUTE_PERMISSIONS.find((route) => route.pattern.test(pathname))
const permissions = route?.permissions ?? []

const authorized =
    !permissions.length
    || (
        route?.restrictAll
        ? permissions.every(perm => user?.permissions?.includes(perm))
        : permissions.some(perm => user?.permissions?.includes(perm))
    )

// Paid-addon module gating: the route's module must be in the company's
// enabled modules (user.modules is absent only for stale sessions — allow).
const moduleAllowed = !route?.module || !user?.modules || user.modules.includes(route.module)

if (!authorized || !moduleAllowed) return <NotFound />
return children
}
