
import { PropsWithChildren, ReactNode, useContext, useEffect, useState } from "react"
import { LazyContext } from "./hooks"
import { useDelayed } from "./internal"
import { LazyEvent, LazyOptions, LazyOverrides, LazySettled } from "./types"

export interface LazyProps<D> {

    readonly event: LazyEvent<D>
    readonly overrides?: (LazyOverrides | undefined)[] | undefined
    readonly children: (value: D) => ReactNode

}

function useLazyState<D>(event: LazyEvent<D>, options: LazyOptions) {
    const [settled, setSettled] = useState<LazySettled<D>>()
    useEffect(() => {
        if (event.status === "fulfilled" || event.status === "rejected") {
            setSettled(event)
        }
    }, [
        event
    ])
    const ready = useDelayed(event.status === "loading" ? options.delay ?? 0 : 0)
    if (!ready) {
        if (settled === undefined) {
            return {
                status: "invisible" as const
            }
        }
        return settled
    }
    if (event.status === "loading") {
        if (settled === undefined) {
            return {
                status: "loading" as const
            }
        }
        else {
            return {
                status: "reloading" as const,
                settled
            }
        }
    }
    else {
        if (event.status === "rejected") {
            return {
                status: "rejected" as const,
                reason: event.reason
            }
        }
        else {
            return {
                status: "fulfilled" as const,
                value: event.value
            }
        }
    }
}

export function Lazy<D>(props: LazyProps<D>): ReactNode {
    const context = useContext(LazyContext)
    const options = { ...context, ...props.overrides }
    const state = useLazyState(props.event, options)
    const onReloading = options.onReloading ?? ((props: PropsWithChildren) => props.children)
    return onReloading({
        reloading: state.status === "reloading",
        children: (() => {
            if (state.status === "invisible") {
                return null
            }
            else if (state.status === "loading") {
                if (options.onLoading === undefined) {
                    return null
                }
                return options.onLoading()
            }
            else if (state.status === "reloading") {
                if (state.settled.status === "rejected") {
                    if (options.onError === undefined) {
                        throw state.settled.reason
                    }
                    return options.onError({ reason: state.settled.reason })
                }
                else {
                    return props.children(state.settled.value)
                }
            }
            else {
                if (state.status === "rejected") {
                    if (options.onError === undefined) {
                        throw state.reason
                    }
                    return options.onError({ reason: state.reason })
                }
                else {
                    return props.children(state.value)
                }
            }
        })()
    })
}
