
import { ComponentType, createElement, Fragment, useContext, useEffect, useRef, useState } from "react"
import { LazyContext, LazyOptions, LazyOverrides } from "."
import { defaultLazyOptions, processLazyOptions, useDelayed } from "./internal"

export type LazyProps<D, P> = LazyOverrides<P> & {
    pass: P
    component: ComponentType<P & D>//TODO does component need to accept both? thought we could just merge P with D.
    result?: PromiseSettledResult<D>
}

type RenderLazyArguments<P, D> = {
    result: PromiseSettledResult<D> | undefined
    pass: P
    render: (value: D) => JSX.Element
    overrides?: LazyOverrides<P>
}

//TODO rm?
export function renderLazy<D, P extends {}>(args: RenderLazyArguments<P, D>) {
    const defaults = useContext(LazyContext)
    const isFirstMount = useRef(true)
    const [prev, setPrev] = useState(args.result)
    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false
        }
        else {
            if (args.result !== undefined) {
                setPrev(args.result)
            }
        }
    }, [args.result])
    // }, [props.result === undefined])//TODO shouldnt this update if props.result changes at all?
    const options = processLazyOptions({ ...defaultLazyOptions, ...defaults, ...args.overrides }, args.pass)
    const data = args.result ?? prev
    const isLoading = data === undefined || (args.result === undefined && !options.distinguishReloading)
    const isReloading = args.result === undefined
    const loadingReady = useDelayed(isLoading ? options.loadingDelay : 0)
    const reloadingReady = useDelayed(isReloading ? options.reloadingDelay : 0)
    if (isLoading) {
        if (!options.showLoading || !loadingReady) {
            return <Fragment />
        }
        return createElement(options.onLoading, { ...args.pass, title: options.loadingTitle })
    }
    else {
        return createElement(options.onReloading, {
            ...args.pass,
            reloading: options.showReloading && isReloading && reloadingReady,
            title: options.reloadingTitle,
            children: (() => {
                if (data.status === "rejected") {
                    //return options.onError({ ...pass, error: data.reason })
                    return createElement(options.onError, { ...args.pass, error: data.reason })
                }
                else {
                    return args.render(data.value)
                }
            })()
        })
    }
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
    }, [props.result])
    // }, [props.result === undefined])//TODO shouldnt this update if props.result changes at all?
    const options = processLazyOptions({ ...defaultLazyOptions, ...defaults, ...props as LazyOptions<P> }, props.pass)
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
