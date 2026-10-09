import { useAtom } from 'jotai'
import { requestCount } from "@/_state/globalStore"
import { useEffect, useState, useRef } from 'react'

export default function GlobalLoadingBar() {
    const [count] = useAtom(requestCount)
    const [progress, setProgress] = useState(0)
    const maxRequestsRef = useRef(1)
    
    useEffect(() => {
        if (count > 0) {
            // Track the maximum concurrent requests seen
            maxRequestsRef.current = Math.max(maxRequestsRef.current, count)
            
            // Calculate progress based on queue position
            const queueProgress = ((maxRequestsRef.current - count) / maxRequestsRef.current) * 70 + 30
            setProgress(Math.min(queueProgress, 95))
        } else {
            // All requests complete
            setProgress(100)
            maxRequestsRef.current = 1 // Reset for next time
            
            const timeout = setTimeout(() => setProgress(0), 300)
            return () => clearTimeout(timeout)
        }
    }, [count])

    return <progress className={`progress progress-primary w-full h-1 align-top transition-opacity ${progress > 0 && progress < 100 ? "visible" : "bg-base-200/50"}`} value={progress} max="100"></progress>
}