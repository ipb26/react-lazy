
import { Fragment, ReactNode, createContext, createElement, useContext, useEffect, useRef, useState } from "react"
import { callOrGet } from "value-or-factory"
import { DEFAULT_LAZY_OPTIONS, LazyMeta, LazyOverrides, LazyResult, LazySettled, LazyState } from "./types"

export type LazyProps<D> = {
    state: LazyState<D>,
    overrides?: LazyOverrides<D> | undefined,
    render(result: LazyResult<D>): ReactNode
    stackLimit?: number
}

//TODO max stack size?

export const LazyContext = createContext<LazyOverrides>({})

function buildMeta<D>(state: LazyState<D>, revert: (state: LazyState<D>) => void, stackLimit?: number, meta?: LazyMeta<D>): LazyMeta<D> {
    const loading = [...meta?.history.loading ?? [], ...state.status === "loading" ? [state] : []]
    const settled = [...meta?.history.settled ?? [], ...state.status !== "loading" ? [state] : []]
    const fulfilled = [...meta?.history.fulfilled ?? [], ...state.status === "fulfilled" ? [state] : []]
    const rejected = [...meta?.history.rejected ?? [], ...state.status === "rejected" ? [state] : []]
    return {
        startedAt: meta?.startedAt ?? new Date(),
        firstFulfilledAt: meta?.firstFulfilledAt ?? state.status === "fulfilled" ? new Date() : undefined,
        lastFulfilledAt: state.status === "fulfilled" ? new Date() : meta?.lastFulfilledAt,
        counter: (meta?.counter ?? 0) + (state.status === "fulfilled" ? 1 : 0),
        revert,
        history: {
            loading: [...loading.slice(0, 1), ...loading.slice(1, 1 + Math.max(stackLimit ?? loading.length - 2, 0)), ...loading.slice(-1)],
            settled: [...settled.slice(0, 1), ...settled.slice(1, 1 + Math.max(stackLimit ?? settled.length - 2, 0)), ...settled.slice(-1)],
            fulfilled: [...fulfilled.slice(0, 1), ...fulfilled.slice(1, 1 + Math.max(stackLimit ?? fulfilled.length - 2, 0)), ...fulfilled.slice(-1)],
            rejected: [...rejected.slice(0, 1), ...rejected.slice(1, 1 + Math.max(stackLimit ?? rejected.length - 2, 0)), ...rejected.slice(-1)],
        }
    }
}

export function Lazy<D>(props: LazyProps<D>) {
    const context = useContext(LazyContext)
    const first = useIsFirstMount()
    const options = { ...DEFAULT_LAZY_OPTIONS, ...context, ...props.overrides }
    const [state, setState] = useState(props.state)
    const [meta, setMeta] = useState(() => buildMeta(state, setState))
    useEffect(() => {
        if (!first) {
            setState(props.state)
            setMeta(meta => buildMeta(props.state, setState, props.stackLimit, meta))
        }
    }, [first, props.state])
    const loading = state.status === "loading" ? state : undefined
    const settled = state.status !== "loading" ? state : meta.history.settled.at(-1)
    const loadingReady = useDelayed(settled === undefined && options.showLoading ? options.loadingDelay ?? 0 : 0)
    const reloadingReady = useDelayed(loading !== undefined && options.showReloading ? options.reloadingDelay ?? 0 : 0)
    if (settled === undefined || (state.status === "loading" && (options.onReloading === undefined || !options.distinguishReloading))) {
        if (!loadingReady) {
            return <Fragment />
        }
        return <Fragment children={callOrGet(options.onLoading, { title: options.loadingTitle, meta })} />
    }
    else {
        return createElement(Fragment, {
            children: callOrGet(options.onReloading, {
                title: options.reloadingTitle,
                reloading: loading !== undefined && reloadingReady,
                meta,
                children: (() => {
                    const children = ((state: LazySettled<D>) => {
                        if (state.status === "rejected") {
                            return <Fragment children={callOrGet(options.onError, { reason: state.reason, retry: state.retry, meta })} />
                        }
                        else {
                            const result = {
                                ...meta,
                                value: state.value,
                                state: state,
                            }
                            return <Fragment children={props.render(result)} />
                        }
                    })
                    if (options.onReloadError === undefined || !options.distinguishReloadError) {
                        return children(settled)
                    }
                    const rejected = settled.status === "rejected" ? settled : undefined
                    const show = rejected !== undefined ? meta.history.fulfilled.at(-1) ?? settled : settled
                    return callOrGet(options.onReloadError, {
                        reason: rejected?.reason,
                        retry: rejected?.retry,
                        meta,
                        children: children(show)
                    })
                })()
            })
        })
    }
}

function useIsFirstMount() {
    const isFirst = useRef(true)
    if (isFirst.current) {
        isFirst.current = false
        return true
    }
    return isFirst.current
}

function useDelayed(ms: number) {
    const [ready, setReady] = useState(ms === 0)
    useEffect(() => {
        if (ms > 0) {
            if (ready) {
                setReady(false)
            }
            const timer = setTimeout(() => setReady(true), ms)
            return () => {
                clearTimeout(timer)
            }
        }
    }, [ms])
    return ready
}
