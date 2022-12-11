
import { ComponentType, createElement, Fragment, useContext, useEffect, useRef, useState } from "react"
import { LazyContext, LazyOverrides } from "."
import { defaultLazyOptions, processLazyOptions, useDelayed } from "./internal"

export type LazyProps<D, P> = LazyOverrides<P> & {
    pass: P
    component: ComponentType<P & D>
    result?: PromiseSettledResult<D>
}

export function Lazy<D extends {}, P extends {}>(props: LazyProps<D, P>) {
    const defaults = useContext(LazyContext)
    const isFirstMount = useRef(true)
    const [prev, setPrev] = useState(props.result)
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false
        }
        else {
            if (props.result !== undefined) {
                setPrev(props.result)
            }
        }
    }, [props.result === undefined])
    const options = processLazyOptions({ ...defaultLazyOptions, ...defaults, ...props }, props.pass)
    const data = props.result ?? prev
    const isLoading = data === undefined || (props.result === undefined && !options.distinguishReloading)
    const isReloading = props.result === undefined
    const loadingReady = useDelayed(isLoading ? options.loadingDelay : 0)
    const reloadingReady = useDelayed(isReloading ? options.reloadingDelay : 0)
    if (isLoading) {
        if (!options.showLoading || !loadingReady) {
            return <Fragment />
        }
        return createElement(options.onLoading, { ...props.pass, title: options.loadingTitle })
    }
    else {
        return createElement(options.onReloading, {
            ...props.pass,
            reloading: options.showReloading && isReloading && reloadingReady,
            title: options.reloadingTitle,
            children: (() => {
                if (data.status === "rejected") {
                    return createElement(options.onError, { ...props.pass, error: data.reason })
                }
                else {
                    return createElement(props.component, { ...props.pass, ...data.value })
                }
            })()
        })
    }
}
