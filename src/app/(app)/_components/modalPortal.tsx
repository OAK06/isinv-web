"use client"
import { createPortal } from "react-dom"
import { ReactNode, useEffect, useState } from "react"

export default function ModalPortal({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])

    if (!mounted) return null

    return createPortal(children, document.body)
}