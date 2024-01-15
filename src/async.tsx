
import { ComponentType, ReactNode, createElement, useCallback, useEffect, useMemo, useState } from "react"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { Lazy, LazyEvent, LazyOverrides, LazyState, useLazyState } from "."
import { PropsWithState, addProps } from "./internal"

/**
 * Options for the async hook.
 * @typeParam D The data type.
 */
export type AsyncOptions<D> = {

    /**
     * A function that returns a promise. This MUST be memoized - it will re-run every time a new value is received. Use the useCallback hook.
     */
    readonly promise: ValueOrFactory<PromiseLike<D>>

    /**
     * An option cleanup function for unmount or reload.
     * @param value The value.
     */
    readonly cleanup?: (value: D) => void

    /**
     * TODO
     */
    readonly defer?: boolean

    /**
     * The initial value to pass through before the first promise runs.
     */
    readonly initial?: D

}

//TODO just merge this back with lazyStates
type AsyncState<D> = AsyncDeferredState | AsyncLoadingState | AsyncFulfilledState<D> | AsyncRejectedState
type AsyncDeferredState = { status: "deferred" }
type AsyncLoadingState = { status: "loading" }
type AsyncFulfilledState<D> = { status: "fulfilled", value: D }
type AsyncRejectedState = { status: "rejected", reason: unknown }

type AsyncResult<D> = { state: AsyncState<D>, run(): void }

//TODO private
export function useAsync<D>(options: AsyncOptions<D>): AsyncResult<D> {

    const [promise, setPromise] = useState<PromiseLike<D>>()
    const [state, setResult] = useState<AsyncState<D>>(() => {
        if (options.defer) {
            return {
                status: "deferred",
            }
        }
        else if ("initial" in options) {
            return {
                status: "fulfilled",
                value: options.initial
            }
        }
        else {
            return {
                status: "loading",
            }
        }
    })

    const run = useCallback(async () => setPromise(callOrGet(options.promise)), [options.promise])

    useEffect(() => {
        if (options.defer !== true) {
            run()
        }
    }, [
        options.defer,
        run
    ])

    useEffect(() => {
        if (promise !== undefined) {
            setResult({ status: "loading" })
            promise.then(value => {
                setResult({
                    status: "fulfilled",
                    value
                })
            }, reason => {
                setResult({
                    status: "rejected",
                    reason
                })
            })
            return () => {
                promise.then(options.cleanup)
            }
        }
    }, [
        promise,
        options.cleanup
    ])

    const result = useMemo(() => {
        return {
            state,
            run,
        }
    }, [
        state,
        run
    ])

    return result

}

type AsyncActions = { readonly run: () => void }
type AsyncLazyState<D> = LazyState<D> & AsyncActions

export function useAsyncLazy<D>(options: AsyncOptions<D>): AsyncLazyState<D> {
    const result = useAsync(options)
    const event = useMemo<LazyEvent<D>>(() => {
        if (result.state.status === "deferred" || result.state.status === "loading") {
            return {
                status: "loading" as const
            }
        }
        if (result.state.status === "rejected") {
            return {
                status: "rejected" as const,
                reason: result.state.reason,
                retry: result.run,
            }
        }
        return {
            status: "fulfilled" as const,
            value: result.state.value
        }
    }, [
        result
    ])
    const state = useLazyState(event)
    return useMemo(() => {
        return {
            ...state,
            run: result.run,
        }
    }, [
        state,
        result.run,
    ])
}

export type AsyncifiedData<D> = { value: D, run(): void }
export type AsyncifiedOptions<D> = AsyncOptions<D> & { overrides?: ValueOrFactory<LazyOverrides<D>, [AsyncActions]> }
export type AsyncifiedPass<K extends string, D> = PropsWithState<K, D, AsyncLazyState<D>>

export function asyncified<I extends {}, D, K extends string>(key: K, factory: (props: I) => AsyncifiedOptions<D>) {
    return (component: ComponentType<Omit<I, keyof AsyncifiedPass<K, D>> & AsyncifiedPass<K, D>>) => {
        return (props: I) => {
            const options = factory(props)
            const state = useAsyncLazy(options)
            const overrides = callOrGet(options.overrides, state)
            return <Lazy state={state}
                overrides={overrides}
                children={value => createElement(component, { ...props, ...addProps(key, value, state) })} />
        }
    }
}

export type AsyncifiedProps<D> = AsyncifiedOptions<D> & {

    readonly children: (value: D, state: LazyState<D>) => ReactNode

}

export const Asyncified = <D,>(props: AsyncifiedProps<D>) => {
    const state = useAsyncLazy(props)
    return <Lazy state={state}
        overrides={callOrGet(props.overrides, state)}
        children={value => props.children(value, state)} />
}

/*
    on?: {
        [K in keyof AsyncStates<D>]?: (state: AsyncStates<D>[K]) => void | Promise<void>
    }
type AsyncStates<D> = {
    change: AsyncState<D>
    deferred: void
    loading: void
    settled: AsyncSettledState<D>
    fulfilled: D
    rejected: unknown
}

useEffect(() => {
    options.on?.change?.(state)
    if (state.status === "fulfilled" || state.status === "rejected") {
        options.on?.settled?.(state)
    }
    if (state.status === "fulfilled") {
        options.on?.fulfilled?.(state.value)
    }
    if (state.status === "rejected") {
        options.on?.rejected?.(state.reason)
    }
    if (state.status === "loading") {
        options.on?.loading?.()
    }
    if (state.status === "deferred") {
        options.on?.deferred?.()
    }
}, [
    state
])

*/
