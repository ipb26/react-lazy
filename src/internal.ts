import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { LazyContext } from "./hooks"
import { LazyEvent, LazyEventType, LazyEventTypes, LazyHistory, LazyOptions, LazyOverrides } from "./types"

export type PropsWithState<K extends string, D, S> = { readonly [X in K]: D } & { readonly [P in `${K}State`]: S }

export function addProps<K extends string, D, S>(key: K, value: D, state: S) {
    return {
        [key]: value,
        [key + "State"]: state
    } as { [X in K]: D } & { [P in `${K}State`]: S }
}

export function isType<D, K extends LazyEventType<D>>(key: K) {
    return (event: LazyEvent<D>): event is LazyEventTypes<D>[K] => {
        if (key === "settled") {
            return event.status === "fulfilled" || event.status === "rejected"
        }
        else {
            return event.status === key
        }
    }
}

export const DEFAULT_LAZY_OPTIONS: LazyOptions = {
    showLoading: true,
    showReloading: true,
    distinguishReloading: true,
    distinguishReloadError: false,
    loadingDelay: 10,
    reloadingDelay: 10
}

export function addToHistory<T>(history: LazyHistory<T>, event: T | undefined) {
    if (event === undefined) {
        return history
    }
    const historyEvent = { date: new Date(), ...event }
    return {
        count: history.count + 1,
        last: historyEvent,
        first: history.first ?? historyEvent,
    }
}

export function useLazyOptions<D>(overrides: (LazyOverrides<D> | undefined)[]) {
    const context = useContext(LazyContext)
    return useMemo(() => {
        return {
            ...DEFAULT_LAZY_OPTIONS,
            ...context,
            ...Object.assign({}, ...overrides)
        }
    }, [
        DEFAULT_LAZY_OPTIONS,
        context,
        overrides
    ]) as LazyOptions<D>
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
