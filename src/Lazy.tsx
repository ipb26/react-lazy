
import { createElement, Fragment, ReactNode, useContext, useEffect, useRef, useState } from "react"
import { callOrGet } from "value-or-factory"
import { LazyContext, LazyOverrides, LazyResult } from "."
import { defaultLazyOptions, useDelayed } from "./internal"

export type LazyProps<D> = { result: LazyResult<D>, overrides?: LazyOverrides, render(data: D): ReactNode }

export function Lazy<D>(props: LazyProps<D>) {
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
    }, [props.result])
    const options = { ...defaultLazyOptions, ...defaults, ...props.overrides }
    const data = props.result ?? prev
    const isLoading = data === undefined || (props.result === undefined && !options.distinguishReloading)
    const isReloading = props.result === undefined
    const loadingReady = useDelayed(isLoading ? options.loadingDelay : 0)
    const reloadingReady = useDelayed(isReloading ? options.reloadingDelay : 0)
    if (isLoading) {
        if (!options.showLoading || !loadingReady) {
            return <Fragment />
        }
        return <Fragment children={callOrGet(options.onLoading, { title: options.loadingTitle })} />
    }
    else {
        return createElement(Fragment, {
            children: callOrGet(options.onReloading, {
                reloading: options.showReloading && isReloading && reloadingReady,
                title: options.reloadingTitle,
                children: (() => {
                    if (data.status === "rejected") {
                        return <Fragment children={callOrGet(options.onError, { error: data.reason, retry: data.retry })} />
                    }
                    else {
                        return <Fragment children={props.render(data.value)} />
                    }
                })()
            })
        })
    }
}
