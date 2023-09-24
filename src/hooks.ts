import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { LazyContext } from "./components"
import { LazyMeta, addToMeta } from "./meta"
import { DEFAULT_LAZY_OPTIONS, LazyOptions, LazyOverrides, LazyState } from "./types"

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

export function useLazyMeta<D>(inputState: LazyState<D>, options: LazyOptions<D>) {
    const [state, revert] = useState(inputState)
    const [meta, setMeta] = useState<LazyMeta<D>>(() => addToMeta(state, revert, options.stackLimit))
    const first = useIsFirstMount()
    useEffect(() => {
        if (!first) {
            revert(inputState)
        }
    }, [
        inputState
    ])
    useEffect(() => {
        if (!first) {
            setMeta(meta => addToMeta(state, revert, options.stackLimit, meta))
        }
    }, [
        state
    ])
    return meta
}

export function useLazyOptions<D>(overrides?: LazyOverrides<D> | undefined) {
    const context = useContext(LazyContext)
    return useMemo(() => {
        return {
            ...DEFAULT_LAZY_OPTIONS,
            ...context,
            ...overrides
        }
    }, [
        DEFAULT_LAZY_OPTIONS,
        context,
        overrides,
    ])
}
