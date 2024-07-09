import { useEffect, useRef, useState } from "react"

export type KeyProps<K extends string, D> = { readonly [X in K]: D }// & { readonly [P in `${K}State`]: S }

export function addProps<K extends string, D>(key: K, value: D) {
    return {
        [key]: value
    } as { readonly [X in K]: D }// & { readonly [P in `${K}State`]: S }
}

export function useIsFirstMount() {
    const isFirst = useRef(true)
    if (isFirst.current) {
        isFirst.current = false
        return true
    }
    return isFirst.current
}

export function useDelayed(ms: number) {
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
    }, [
        ms
    ])
    return ready
}
