
import { ReactNode, useEffect } from "react"
import { callOrGet } from "value-or-factory"
import { useLazyState } from "./hooks"
import { useLazyOptions } from "./internal"
import { LazyEvents, LazyOptions, LazyOverrides, LazyState } from "./types"

export interface LazyProps<D> {

    readonly events: LazyEvents<D>
    readonly overrides?: (LazyOverrides<D> | undefined)[] | undefined
    readonly children: (value: D, state: LazyState<D>) => ReactNode

}

//TODO what about onreloaderror

function useCurrentLazyState<D>(state: LazyState<D>, options: LazyOptions<D>) {
    if (state.current.status === "loading") {
        const inner = state.history.settled.last
        if (inner === undefined || options.distinguishReloading === false) {
            return {
                status: "loading" as const
            }
        }
        else {
            return {
                status: "reloading" as const,
                inner
            }
        }
    }
    else {
        if (state.current.status === "rejected") {
            return {
                status: "rejected" as const,
                reason: state.current.reason,
                retry: state.current.retry
            }
        }
        else {
            return {
                status: "fulfilled" as const,
                value: state.current.value
            }
        }
    }
}

//TODO loading delays
export function Lazy<D>(props: LazyProps<D>) {
    const options = useLazyOptions(props.overrides ?? [])
    const state = useLazyState(props.events)
    const current = useCurrentLazyState(state, options)
    useEffect(() => {
        [props.events].flat().forEach(event => {
            options.onChange?.(event)
        })
    }, [
        props.events
    ])
    return callOrGet(options.onReloading, {
        title: options.reloadingTitle,
        reloading: current.status === "reloading",
        state: state,
        children: (() => {
            if (current.status === "rejected") {
                if (options.onError === undefined) {
                    throw current.reason
                }
                return callOrGet(options.onError, { reason: current.reason, retry: current.retry, state })
            }
            else if (current.status === "loading") {
                return callOrGet(options.onLoading, { title: options.loadingTitle, state })
            }
            else if (current.status === "fulfilled") {
                if (options.onRender === undefined) {
                    return props.children(current.value, state)
                }
                return callOrGet(options.onRender, { children: props.children(current.value, state), state })
            }
            else {
                if (current.inner.status === "rejected") {
                    if (options.onError === undefined) {
                        throw current.reason
                    }
                    return callOrGet(options.onError, { reason: current.reason, retry: current.retry, state })
                }
                else {
                    if (options.onRender === undefined) {
                        return props.children(current.inner.value, state)
                    }
                    return callOrGet(options.onRender, { children: props.children(current.inner.value, state), state })
                }
            }
        })()
    })
    /*
    const state = props.state
    const loading = state.current.status === "loading" ? state.current : undefined
    const settled = state.current.status !== "loading" ? state.current : state.history.settled.last
    const loadingReady = useDelayed(settled === undefined && options.showLoading ? options.loadingDelay ?? 0 : 0)
    const reloadingReady = useDelayed(loading !== undefined && options.showReloading ? options.reloadingDelay ?? 0 : 0)
    if (props.log) {
        console.log("TODO", props.state)
    }
    if (settled === undefined || (state.current.status === "loading" && (options.onReloading === undefined || !options.distinguishReloading))) {
        if (!loadingReady || options.onLoading === undefined) {
            return null
        }
        return callOrGet(options.onLoading, { title: options.loadingTitle, state })
    }
    else {
        const reloadingChildren = (() => {
            const children = ((event: LazySettled<D>) => {
                if (event.status === "rejected") {
                    if (options.onError === undefined) {
                        throw event.reason
                    }
                    return callOrGet(options.onError, { reason: event.reason, retry: event.retry, state })
                }
                else {
                    if (options.onRender === undefined) {
                        return props.children(event.value)
                    }
                    return callOrGet(options.onRender, { children: props.children(event.value), state })
                }
            })
            if (options.onReloadError === undefined) {
                return children(settled)
            }
            // Consider it rejected if distinguish is turned on and it's rejected.
            // Otherwise, we are going to call it, then put the actual error inside of it.
            const { reloadError, show } = (() => {
                if (options.distinguishReloadError) {
                    if (settled.status === "rejected") {
                        return {
                            reloadError: settled,
                            show: state.history.fulfilled.last ?? settled,
                        }
                    }
                }
                return {
                    reloadError: undefined,
                    show: settled,
                }
            })()
            return callOrGet(options.onReloadError, {
                reason: reloadError?.reason,
                retry: reloadError?.retry,
                state,
                children: children(show)
            })
        })()
        if (options.onReloading === undefined) {
            return reloadingChildren
        }
        if (props.log) {
            console.log("TODO reloading")
        }
        return callOrGet(options.onReloading, {
            title: options.reloadingTitle,
            reloading: loading !== undefined && reloadingReady,
            state,
            children: reloadingChildren
        })
    }*/
}
