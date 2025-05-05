
import { PropsWithChildren, ReactNode, useContext, useRef } from "react"
import { LazyContext } from "./hooks"
import { useIsFirstMount } from "./internal"
import { LazyEvent, LazyOverrides, LazySettled } from "./types"

export interface LazyProps<D> {

    readonly event: LazyEvent<D>
    readonly overrides?: LazyOverrides | undefined
    readonly children: ReactNode | ((value: D, state: LazyState<D>) => ReactNode)

}

//export type LazyState<D> = ReturnType<typeof useLazyState<D>>

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

export type LazyState<D> = {
    //readonly status: "loading"
    readonly isLoading: true
    readonly isReloading: false
    readonly isSettled: false
    readonly isFulfilled: false
    readonly isRejected: false
} | {
    //readonly status: "reloading"
    readonly isLoading: true
    readonly isReloading: true
    readonly isSettled: true
    readonly isFulfilled: true
    readonly isRejected: false
    readonly value: D
} | {
    //readonly status: "reloading"
    readonly isLoading: true
    readonly isReloading: true
    readonly isSettled: true
    readonly isFulfilled: false
    readonly isRejected: true
    readonly reason: unknown
    readonly retry?: (() => void) | undefined
} | {
    //readonly status: "fulfilled"
    readonly isLoading: false
    readonly isReloading: false
    readonly isSettled: true
    readonly isFulfilled: true
    readonly isRejected: false
    readonly value: D
} | {
    //readonly status: "rejected"
    readonly isLoading: false
    readonly isReloading: false
    readonly isSettled: true
    readonly isFulfilled: false
    readonly isRejected: true
    readonly reason: unknown
    readonly retry?: (() => void) | undefined
}

export function useLazyState<D>(current: LazyEvent<D>): LazyState<D> {
    const settled = usePrevious<LazySettled<D>>(current.status === "fulfilled" || current.status === "rejected" ? { current } : undefined)
    if (current.status === "loading") {
        if (settled === undefined) {
            return {
                //   status: "loading" as const,
                isLoading: true as const,
                isReloading: false as const,
                isSettled: false as const,
                isRejected: false as const,
            }
        }
        else {
            if (settled.status === "fulfilled") {
                return {
                    // status: "reloading" as const,
                    isLoading: true as const,
                    isReloading: true as const,
                    isSettled: true as const,
                    isFulfilled: true as const,
                    isRejected: false as const,
                    value: settled.value,
                    // result: current,
                }
            }
            else {
                return {
                    //     status: "reloading" as const,
                    isLoading: true as const,
                    isReloading: true as const,
                    isSettled: true as const,
                    isFulfilled: false as const,
                    isRejected: true as const,
                    reason: settled.reason,
                    retry: settled.retry,
                    //   result: current,
                }
            }
        }
    }
    if (current.status === "fulfilled") {
        return {
            //   status: "fulfilled" as const,
            isLoading: false as const,
            isReloading: false as const,
            isSettled: true as const,
            isFulfilled: true as const,
            isRejected: false as const,
            value: current.value,
        }
    }
    else {
        return {
            //   status: "rejected" as const,
            isLoading: false as const,
            isReloading: false as const,
            isSettled: true as const,
            isFulfilled: false as const,
            isRejected: true as const,
            reason: current.reason,
            retry: current.retry,
        }
    }
}

export function Lazy<D>(props: LazyProps<D>): ReactNode {
    const context = useContext(LazyContext)
    const options = { ...context, ...props.overrides }
    const state = useLazyState(props.event)
    if (state.isLoading && !state.isSettled) {
        if (options.onLoading === undefined) {
            return null
        }
        return options.onLoading({
            message: options.loadingMessage ?? options.defaultMessage
        })
    }
    const onReloading = options.onReloading ?? ((props: PropsWithChildren) => props.children)
    return onReloading({
        reloading: state.isLoading,
        message: options.reloadingMessage ?? options.defaultMessage,
        children: (() => {
            if (state.isRejected) {
                if (options.onError === undefined) {
                    throw state.reason
                }
                return options.onError({
                    reason: state.reason,
                    message: options.errorMessage ?? options.defaultMessage,
                })
            }
            else {
                return typeof props.children === "function" ? props.children(state.value, state) : props.children
            }
        })()
    })
}
