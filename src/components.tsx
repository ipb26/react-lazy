
import { PropsWithChildren, ReactNode, useContext, useEffect, useState } from "react"
import { LazyContext } from "./hooks"
import { LazyEvent, LazyOverrides, LazySettled } from "./types"

export interface LazyProps<D> {

    readonly event: LazyEvent<D>
    readonly overrides?: LazyOverrides | undefined
    readonly children: ReactNode | ((value: D, state: LazyState<D>) => ReactNode)

}

export type LazyState<D> = {
    readonly status: "loading"
    readonly isLoading: true
    readonly isSettled: false
} | {
    readonly status: "reloading"
    readonly data: LazySettled<D>
    readonly isLoading: true
    readonly isSettled: true
} | {
    readonly status: "settled"
    readonly data: LazySettled<D>
    readonly isLoading: false
    readonly isSettled: true
}

export function useLazyState<D>(newEvent: LazyEvent<D>): LazyState<D> {
    const [settled, setSettled] = useState<LazySettled<D>>()
    const event = newEvent
    useEffect(() => {
        if (event === undefined) {
            return
        }
        if (event.status === "fulfilled" || event.status === "rejected") {
            setSettled(event)
        }
    }, [
        event
    ])
    if (event.status === "loading") {
        if (settled === undefined) {
            return {
                status: "loading",
                isLoading: true,
                isSettled: false,
            }
        }
        else {
            return {
                status: "reloading",
                isLoading: true,
                isSettled: true,
                data: settled
            }
        }
    }
    return {
        status: "settled",
        isLoading: false,
        isSettled: true,
        data: event
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
        return options.onLoading({ message: options.loadingMessage })
    }
    const onReloading = options.onReloading ?? ((props: PropsWithChildren) => props.children)
    return onReloading({
        reloading: state.status === "reloading",
        message: options.reloadingMessage,
        children: (() => {
            if (state.data.status === "rejected") {
                if (options.onError === undefined) {
                    throw state.data.reason
                }
                return options.onError({ reason: state.data.reason, message: options.errorMessage })
            }
            else {
                return typeof props.children === "function" ? props.children(state.data.value, state) : props.children
            }
            /*
            else if (state.status === "reloading") {
                if (state.data.status === "rejected") {
                    if (options.onError === undefined) {
                        throw state.data.reason
                    }
                    return options.onError({ reason: state.data.reason, message: options.errorMessage })
                }
                else {
                    return typeof props.children === "function" ? props.children(state.data.value, state) : props.children
                }
            }
            else {
                if (state.data.status === "rejected") {
                    if (options.onError === undefined) {
                        throw state.data.reason
                    }
                    return options.onError({ reason: state.data.reason, message: options.errorMessage })
                }
                else {
                    return typeof props.children === "function" ? props.children(state.data.value, state) : props.children
                }
            }*/
        })()
    })
}
