
import { ReactNode, createContext } from "react"
import { callOrGet } from "value-or-factory"
import { useDelayed, useLazyMeta, useLazyOptions } from "./hooks"
import { LazyMeta } from "./meta"
import { LazyOverrides, LazySettled, LazyState } from "./types"

export type LazyProps<D> = {

    state: LazyState<D>,
    overrides?: LazyOverrides<D> | undefined,
    children: (result: D, meta: LazyMeta<D>) => ReactNode

}

export const LazyContext = createContext<LazyOverrides>({})

export function Lazy<D>(props: LazyProps<D>) {
    const options = useLazyOptions(props.overrides)
    const meta = useLazyMeta(props.state, options)
    const loading = meta.state.status === "loading" ? meta.state : undefined
    const settled = meta.state.status !== "loading" ? meta.state : meta.history.settled.stack.at(-1)
    const loadingReady = useDelayed(settled === undefined && options.showLoading ? options.loadingDelay ?? 0 : 0)
    const reloadingReady = useDelayed(loading !== undefined && options.showReloading ? options.reloadingDelay ?? 0 : 0)
    if (settled === undefined || (meta.state.status === "loading" && (options.onReloading === undefined || !options.distinguishReloading))) {
        if (!loadingReady || options.onLoading === undefined) {
            return null
        }
        return callOrGet(options.onLoading, { title: options.loadingTitle, meta: meta })
    }
    else {
        const reloadingChildren = (() => {
            const children = ((state: LazySettled<D>) => {
                if (state.status === "rejected") {
                    if (options.onError === undefined) {
                        throw state.reason
                    }
                    return callOrGet(options.onError, { reason: state.reason, retry: state.retry, meta: meta })
                }
                else {
                    if (options.onRender === undefined) {
                        return props.children(state.value, meta)
                    }
                    return callOrGet(options.onRender, { children: props.children(state.value, meta), meta: meta })
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
                            show: meta.history.fulfilled.stack.at(-1) ?? settled,
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
                meta: meta,
                children: children(show)
            })
        })()
        if (options.onReloading === undefined) {
            return reloadingChildren
        }
        return callOrGet(options.onReloading, {
            title: options.reloadingTitle,
            reloading: loading !== undefined && reloadingReady,
            meta: meta,
            children: reloadingChildren
        })
    }
}
