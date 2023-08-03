
import { useCallback, useEffect, useMemo, useState } from "react"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { LazyOverrides, LazyState, lazified } from "."

/**
 * Options for the async hook.
 * @typeParam D The data type.
 */
export type AsyncOptions<D> = {
    /**
     * A function that returns a promise. This MUST be memoized - it will re-run every time a new value is received. Use the useCallback hook.
     */
    promise(): Promise<D>
    /**
     * An option cleanup function for unmount or reload.
     * @param value The value.
     */
    cleanup?(value: D): void
    /**
     * Defer the execution of this promise until run is called.
     */
    defer?: boolean
    /**
     * The initial value to pass through before the first promise runs.
     */
    initial?: D
    on?: {
        [K in keyof AsyncStates<D>]?: (state: AsyncStates<D>[K]) => void | Promise<void>
    }
}

type AsyncStates<D> = {
    change: AsyncState<D>
    deferred: void
    loading: void
    settled: AsyncSettledState<D>
    fulfilled: D
    rejected: unknown
}

type AsyncState<D> = AsyncDeferredState | AsyncLoadingState | AsyncFulfilledState<D> | AsyncRejectedState
type AsyncDeferredState = { status: "deferred" }
type AsyncLoadingState = { status: "loading" }
type AsyncFulfilledState<D> = { status: "fulfilled", value: D }
type AsyncRejectedState = { status: "rejected", reason: unknown }
type AsyncSettledState<D> = AsyncFulfilledState<D> | AsyncRejectedState

type AsyncResult<D> = AsyncState<D> & { run(): void }

export function useAsync<D>(options: AsyncOptions<D>): AsyncResult<D> {

    const [promise, setPromise] = useState<Promise<D>>()
    const [result, setResult] = useState<AsyncState<D>>(() => {
        if (options.defer === true) {
            return {
                status: "deferred"
            }
        }
        else {
            if ("initial" in options) {
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
        }
    })

    const run = useCallback(async () => setPromise(options.promise()), [options.promise])

    useEffect(() => {
        if (options.defer !== true) {
            run()
        }
    }, [run])

    useEffect(() => {
        if (promise !== undefined) {
            setResult({ status: "loading" })
            promise.then(value => setResult({ status: "fulfilled", value }), reason => setResult({ status: "rejected", reason }))
            return () => {
                promise.then(options.cleanup)
            }
        }
    }, [promise, options.cleanup])

    /*
    type AsyncStates<D> = {
        all: AsyncState<D>
        deferred: AsyncDeferredState
        loading: AsyncLoadingState
        settled: AsyncFulfilledState<D> | AsyncRejectedState
        fulfilled: AsyncFulfilledState<D>
        rejected: AsyncRejectedState
    }*/


    useEffect(() => {
        options.on?.change?.(result)
        if (result.status === "fulfilled" || result.status === "rejected") {
            options.on?.settled?.(result)
        }
        if (result.status === "fulfilled") {
            options.on?.fulfilled?.(result.value)
        }
        if (result.status === "rejected") {
            options.on?.rejected?.(result.reason)
        }
        if (result.status === "loading") {
            options.on?.loading?.()
        }
        if (result.status === "deferred") {
            options.on?.deferred?.()
        }
    }, [result])

    return useMemo(() => ({ ...result, run }), [result, run])

}

export function useAsyncAsLazy<D>(result: AsyncResult<D>): LazyState<AsyncifiedData<D>> {
    if (result.status === "deferred" || result.status === "loading") {
        return {
            status: "loading" as const
        }
    }
    else {
        if (result.status === "rejected") {
            return {
                status: "rejected" as const,
                reason: result.reason,
                retry: result.run,
            }
        }
        return {
            status: "fulfilled" as const,
            value: result
        }
    }
}

export type AsyncifiedData<D> = { value: D, run(): void }
export type AsyncifiedOptions<D, P extends {} = {}> = AsyncOptions<D> & { overrides?: ValueOrFactory<LazyOverrides, [AsyncResult<D>]>, props?: P }

export function asyncified<I extends {}, D, K extends string, P extends {}>(key: K, factory: (props: I) => AsyncifiedOptions<D, P>) {
    return lazified(key, (props: I) => {
        const options = factory(props)
        const result = useAsync(options)
        const state = useAsyncAsLazy(result)
        return {
            state,
            overrides: callOrGet(options.overrides, result),
            props: options.props
        }
    })
}

/**
 * Options for the async hook.
 * @typeParam D The data type.
 */
export type DeferredAsyncOptions<D, A extends readonly unknown[]> = {
    /**
     * A function that returns a promise. This MUST be memoized - it will re-run every time a new value is received. Use the useCallback hook.
     */
    promise: (...args: A) => Promise<D>
}

export type AsyncCallbackState<D> = {
    status: "deferred"
} | {
    status: "loading"
} | {
    status: "fulfilled"
    value: D
} | {
    status: "rejected"
    reason: unknown
}

type AsyncCallback<R, A extends readonly unknown[]> = (...args: A) => Promise<R>
type AsyncCallbackOptions<R, A extends readonly unknown[]> = {
    callback: AsyncCallback<R, A>
    propagateErrors?: boolean
}

export function useAsyncCallback<R, A extends readonly unknown[]>(options: AsyncCallbackOptions<R, A>) {
    const [promise, setPromise] = useState<Promise<R>>()
    const [result, setResult] = useState<AsyncCallbackState<R>>({
        status: "deferred"
    })
    useEffect(() => {
        if (promise !== undefined) {
            setResult({ status: "loading" })
            promise.then(value => setResult({ status: "fulfilled", value }), reason => setResult({ status: "rejected", reason }))
        }
    }, [
        promise
    ])
    const run = useCallback(async (...args: A) => setPromise(options.callback(...args)), [options.callback])
    return useMemo(() => ({ ...result, run }), [result, run])
}
