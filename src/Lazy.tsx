
import { Fragment, ReactNode, createElement, useContext, useEffect, useRef, useState } from "react"
import { callOrGet } from "value-or-factory"
import { ErrorProps, LazyContext, LazyOverrides, LazyResult, LazySettled, LoadingProps } from "."
import { defaultLazyOptions, useDelayed } from "./internal"

export type LazyProps<D, L extends LoadingProps, E extends ErrorProps> = { result: LazyResult<D, L, E>, overrides?: LazyOverrides<L, E>, render(data: D): ReactNode }

export function Lazy<D, L extends LoadingProps, E extends ErrorProps>(props: LazyProps<D, L, E>) {
    const defaults = useContext(LazyContext)
    const isFirstMount = useRef(true)
    const [prev, setPrev] = useState<LazySettled<D, E>>()
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false
        }
        else {
            if (props.result.status !== "loading") {
                setPrev(props.result)
            }
        }
    }, [props.result])
    const options = { ...defaultLazyOptions, ...defaults, ...props.overrides }
    const state = (() => {
        if (props.result.status === "loading") {
            if (prev === undefined || !options.distinguishReloading) {
                return {
                    status: "loading" as const,
                    result: props.result
                }
            }
            else {
                return {
                    status: "reloading" as const,
                    pending: props.result,
                    loaded: prev,
                }
            }
        }
        else {
            return {
                status: "settled" as const,
                loaded: props.result,
            }
        }
    })()
    const loadingReady = useDelayed(state.status === "loading" ? options.loadingDelay : 0)
    const reloadingReady = useDelayed(state.status === "reloading" ? options.reloadingDelay : 0)
    if (state.status === "loading") {
        if (!options.showLoading || !loadingReady) {
            return <Fragment />
        }
        return <Fragment children={callOrGet(options.onLoading, { title: options.loadingTitle, ...state.result })} />
    }
    else {
        return createElement(Fragment, {
            children: callOrGet(options.onReloading, {
                reloading: options.showReloading && state.status === "reloading" && reloadingReady ? { title: options.loadingTitle, ...state.pending } : undefined,
                children: (() => {
                    if (state.loaded.status === "rejected") {
                        return <Fragment children={callOrGet(options.onError, state.loaded.props)} />
                    }
                    else {
                        return <Fragment children={props.render(state.loaded.value)} />
                    }
                })()
            })
        })
    }

    /*if (!TODOx.) {
        TODOx.result
    }
    TODOx.reloading*/

    /*
    const data = props.result ?? prev
    const isLoading = data.status === "loading" ? data : (props.result.status === "loading" && !options.distinguishReloading) ? props.result : undefined
    const isReloading = props.result.status === "loading" ? props.result : undefined
    const loadingReady = useDelayed(isLoading !== undefined ? options.loadingDelay : 0)
    const reloadingReady = useDelayed(isReloading ? options.reloadingDelay : 0)
    if (isLoading !== undefined) {
        if (!options.showLoading || !loadingReady) {
            return <Fragment />
        }
        return <Fragment children={callOrGet(options.onLoading, { ...isLoading, title: options.loadingTitle })} />
    }
    else {
        return createElement(Fragment, {
            children: callOrGet(options.onReloading, {
                //...result.
                //  ...isReloading,
                ...isReloading,
                reloading: options.showReloading && isReloading !== undefined && reloadingReady,
                title: options.reloadingTitle,
                children: (() => {
                    if (data.status === "rejected") {
                        return <Fragment children={callOrGet(options.onError, data)} />
                    }
                    else {
                        return <Fragment children={props.render(data.value)} />
                    }
                })()
            })
        })
    }*/
}
