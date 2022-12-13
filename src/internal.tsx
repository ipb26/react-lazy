import { Fragment, useEffect, useState } from "react"
import { callOrGet } from "value-or-factory"
import { LazyOptions } from "."

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

/**
 * The default lazy options.
 */
export const defaultLazyOptions: LazyOptions = {
    onLoading: () => <Fragment />,
    onReloading: props => <Fragment children={props.children} />,
    onError: props => { throw props.error },
    showLoading: true,
    showReloading: true,
    distinguishReloading: true,
    loadingTitle: undefined,
    reloadingTitle: undefined,
    loadingDelay: 10,
    reloadingDelay: 0,
}

/**
 * Turns lazy options into options using props.
 */
export function processLazyOptions<T>(options: LazyOptions<T>, pass: T) {
    return {
        onLoading: options.onLoading,
        onReloading: options.onReloading,
        onError: options.onError,
        distinguishReloading: callOrGet(options.distinguishReloading, pass),
        showLoading: callOrGet(options.showLoading, pass),
        showReloading: callOrGet(options.showReloading, pass),
        loadingTitle: callOrGet(options.loadingTitle, pass),
        reloadingTitle: callOrGet(options.reloadingTitle, pass),
        loadingDelay: callOrGet(options.loadingDelay, pass),
        reloadingDelay: callOrGet(options.reloadingDelay, pass),
    }
}

export function addKeyToPromiseResult<T, K extends string | number | symbol>(key: K, result: PromiseSettledResult<T> | undefined) {
    if (result?.status === "fulfilled") {
        return {
            status: result.status,
            value: { [key]: result.value } as Record<K, T>
        }
    }
    else {
        return result
    }
}