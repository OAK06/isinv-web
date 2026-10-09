"use client"

import { responseMessage, store } from "@/_state/globalStore"
import { verifyPaymentSession } from "@/app/(app)/memberSessions/_memberSession"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

interface UsePaymentReturnProps {
    branchId: number
    redirectTo: string,
    successMessage: string,
    failedMessage: string
}

export function usePaymentReturn({branchId, redirectTo, successMessage, failedMessage}: UsePaymentReturnProps) {
	const router = useRouter()
    const searchParams = useSearchParams()
    const params = new URLSearchParams(searchParams.toString())
    const paymentSessionId = searchParams.get("payment_session_id")
    const paymentStatusParam = searchParams.get("payment_status")

    const handlePaymentFaild = () => {
        router.push(redirectTo)
        store.set(responseMessage, { type: 'alert', text: failedMessage })
    }
    
    useEffect(() => {
        if (!paymentSessionId || branchId === -1) return 
        
        verifyPaymentSession({
            branch_id: branchId,
            payment_session_id: paymentSessionId
        }).then((returnData) => {
            if (returnData.response.payment_status === 'unpaid') return handlePaymentFaild()
            
            router.push(redirectTo)
            store.set(responseMessage, { type: 'success', text: successMessage })
        })

        params.delete('payment_session_id')
        router.replace(`?${params.toString()}`, { scroll: false })
    }, [paymentSessionId, branchId])

    useEffect(() => {
        if (!paymentStatusParam) return
        
        if (paymentStatusParam === 'canceled') handlePaymentFaild()
        params.delete('payment_status')
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [paymentStatusParam])
}
