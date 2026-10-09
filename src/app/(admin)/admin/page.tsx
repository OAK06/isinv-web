"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** /admin → the admin dashboard. */
export default function AdminIndex() {
    const router = useRouter()
    useEffect(() => { router.replace('/admin/dashboard') }, [])
    return null
}
