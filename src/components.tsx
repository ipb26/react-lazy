
import { PropsWithChildren, ReactNode, useContext, useRef } from "react"
import { LazyContext } from "./hooks"
import { useIsFirstMount } from "./internal"
import { LazyEvent, LazyOverrides, LazySettled } from "./types"

export interface LazyProps<D> {

    readonly event: LazyEvent<D>
    readonly overrides?: LazyOverrides | undefined
    readonly children: ReactNode | ((value: D, state: LazyState<D>) => ReactNode)

}

export type LazyState<D> = ReturnType<typeof useLazyState<D>>

export function usePrevious<T>(value: { readonly current: T } | undefined) {
    const previous = useRef(value?.current)
    const first = useIsFirstMount()
    if (!first) {
        if (value !== undefined) {
            previous.current = value.current
        }
    }
    return previous.current
}

export function useLazyState<D>(current: LazyEvent<D>) {
    const settled = usePrevious<LazySettled<D>>(current.status === "fulfilled" || current.status === "rejected" ? { current } : undefined)
    if (current.status === "loading") {
        if (settled === undefined) {
            return {
                status: "loading" as const,
                isLoading: true,
                isSettled: false,
            }
        }
        else {
            return {
                status: "reloading" as const,
                isLoading: true,
                isSettled: true,
                data: settled
            }
        }
    }
    return {
        status: "settled" as const,
        isLoading: false,
        isSettled: true,
        data: current
    }
}

export function Lazy<D>(props: LazyProps<D>): ReactNode {
    const context = useContext(LazyContext)
    const options = { ...context, ...props.overrides }
    const state = useLazyState(props.event)
    if (state.status === "loading") {
        if (options.onLoading === undefined) {
            return null
        }
        return options.onLoading({
            message: options.loadingMessage ?? options.defaultMessage
        })
    }
    const onReloading = options.onReloading ?? ((props: PropsWithChildren) => props.children)
    return onReloading({
        reloading: state.status === "reloading",
        message: options.reloadingMessage ?? options.defaultMessage,
        children: (() => {
            if (state.data.status === "rejected") {
                if (options.onError === undefined) {
                    throw state.data.reason
                }
                return options.onError({
                    reason: state.data.reason,
                    message: options.errorMessage ?? options.defaultMessage,
                })
            }
            else {
                return typeof props.children === "function" ? props.children(state.data.value, state) : props.children
            }
        })()
    })
}
