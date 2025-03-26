import { useEffect, useRef, useState } from "react"

export function useIsFirstMount() {
    const isFirst = useRef(true)
    if (isFirst.current) {
        isFirst.current = false
        return true
    }
    return isFirst.current
}

export function useElapsed(ms: number) {
    const [ready, setReady] = useState(ms === 0)
    useEffect(() => {
        if (ms > 0) {
            if (ready) {
                setReady(false)
            }
            const timer = setTimeout(() => setReady(true), ms)
            return () => {
                clearTimeout(timer)
            }
        }
        else {
            setReady(true)
        }
    }, [
        ms
    ])
    useEffect(() => {
        if (ready) {
            setReady(false)
        }
    }, [
        ready
    ])
    return ready
}
