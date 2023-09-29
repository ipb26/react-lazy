
import { ReactNode } from "react"
import { callOrGet } from "value-or-factory"
import { useDelayed, useLazyOptions } from "./internal"
import { LazyOverrides, LazySettled, LazyState } from "./types"

export type LazyProps<D> = {

    state: LazyState<D>,
    overrides?: LazyOverrides<D> | undefined
    children: (result: D) => ReactNode

}

export function Lazy<D>(props: LazyProps<D>) {
    const options = useLazyOptions(props.overrides)
    const state = props.state
    const loading = state.current.status === "loading" ? state.current : undefined
    const settled = state.current.status !== "loading" ? state.current : state.history.settled.last
    const loadingReady = useDelayed(settled === undefined && options.showLoading ? options.loadingDelay ?? 0 : 0)
    const reloadingReady = useDelayed(loading !== undefined && options.showReloading ? options.reloadingDelay ?? 0 : 0)
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
        return callOrGet(options.onReloading, {
            title: options.reloadingTitle,
            reloading: loading !== undefined && reloadingReady,
            state,
            children: reloadingChildren
        })
    }
}
