import { Fragment, useEffect, useState } from "react"
import { ErrorProps, LazyOptions, LazyResult, LoadingProps } from "."

/**
 * Return true after a delay. Reset by changing the timeout.
 */
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
    }, [ms])
    return ready
}

export const defaultLazyOptions: LazyOptions = {
    onLoading: () => <Fragment />,
    onReloading: props => props.children,
    onError: props => { throw props.reason },
    showLoading: true,
    showReloading: true,
    distinguishReloading: true,
    loadingDelay: 10,
    reloadingDelay: 10,
}

export function addKeyToPromiseResult<T, K extends string | number | symbol, L extends LoadingProps, E extends ErrorProps>(key: K, result: LazyResult<T, L, E>) {
    if (result?.status === "fulfilled") {
        return {
            status: result.status,
            value: { [key]: result.value } as Record<K, T>
        }
    }
    return result
}