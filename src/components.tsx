
import { PropsWithChildren, ReactNode, useContext, useEffect, useState } from "react"
import { LazyContext } from "./hooks"
import { useElapsed } from "./internal"
import { LazyEvent, LazyOverrides, LazySettled } from "./types"

export interface LazyProps<D> {

    readonly event: LazyEvent<D>
    readonly overrides?: LazyOverrides | undefined
    readonly children: ReactNode | ((value: D) => ReactNode)

}

type LazyState<D> = {
    readonly status: "invisible"
} | {
    readonly status: "loading"
} | {
    readonly status: "reloading"
    readonly data: LazySettled<D>
} | {
    readonly status: "settled"
    readonly data: LazySettled<D>
}

export function useLazyState<D>(event: LazyEvent<D>, overrides?: LazyOverrides | undefined): LazyState<D> {
    const context = useContext(LazyContext)
    const options = { ...context, ...overrides }
    const [settled, setSettled] = useState<LazySettled<D>>()
    useEffect(() => {
        if (event.status === "fulfilled" || event.status === "rejected") {
            setSettled(event)
        }
    }, [
        event
    ])
    const ready = useElapsed(event.status === "loading" ? options.delay ?? 0 : 0)
    if (!ready) {
        if (settled === undefined) {
            return {
                status: "invisible",
            }
        }
        return {
            status: "settled",
            data: settled,
        }
    }
    if (event.status === "loading") {
        if (settled === undefined) {
            return {
                status: "loading",
            }
        }
        else {
            return {
                status: "reloading",
                data: settled
            }
        }
    }
    else {
        return {
            status: "settled",
            data: event
        }
    }
}

export function Lazy<D>(props: LazyProps<D>): ReactNode {
    const context = useContext(LazyContext)
    const options = { ...context, ...props.overrides }
    const state = useLazyState(props.event, props.overrides)
    if (state.status === "loading") {
        if (options.onLoading === undefined) {
            return null
        }
        return options.onLoading()
    }
    const onReloading = options.onReloading ?? ((props: PropsWithChildren) => props.children)
    return onReloading({
        reloading: state.status === "reloading",
        children: (() => {
            if (state.status === "invisible") {
                return null
            }
            else if (state.status === "reloading") {
                if (state.data.status === "rejected") {
                    if (options.onError === undefined) {
                        throw state.data.reason
                    }
                    return options.onError({ reason: state.data.reason })
                }
                else {
                    return typeof props.children === "function" ? props.children(state.data.value) : props.children
                }
            }
            else {
                if (state.data.status === "rejected") {
                    if (options.onError === undefined) {
                        throw state.data.reason
                    }
                    return options.onError({ reason: state.data.reason })
                }
                else {
                    return typeof props.children === "function" ? props.children(state.data.value) : props.children
                }
            }
        })()
    })
}
