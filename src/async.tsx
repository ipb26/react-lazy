
import { ReactNode, useCallback, useEffect, useState } from "react"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { Lazy, LazyEvent, LazyHOCOptions, LazyOverrides, LazyState, lazified } from "."
import { useIsFirstMount } from "./internal"

/**
 * Options for the async hook.
 * @typeParam D The data type.
 */
export type AsyncOptions<D> = {

    /**
     * A promise or a function that returns a promise. This MUST be memoized - the function will re-run every time a new value is received.
     */
    readonly promise: ValueOrFactory<PromiseLike<D>>

    /**
     * Don't execute immediately.
     */
    readonly defer?: AsyncDefer<D> | undefined

}

interface AsyncDefer<D> {

    /**
     * The initial value to provide.
     */
    readonly initial: D

}

export type AsyncLazyEvent<D> = LazyEvent<D> & { readonly retry: Retry }

export function useAsyncLazy<D>(input: AsyncOptions<D> | (() => PromiseLike<D>)): AsyncLazyEvent<D> {
    const options = typeof input === "function" ? { promise: input } : input
    const [state, setResult] = useState<LazyEvent<D>>(options.defer === undefined ? { status: "loading" } : { status: "fulfilled", value: options.defer.initial })
    const isFirstMount = useIsFirstMount()
    const retry = useCallback(() => {
        if (!isFirstMount) {
            setResult({
                status: "loading"
            })
        }
        callOrGet(options.promise).then(value => {
            setResult({
                status: "fulfilled",
                value,
            })
        }, reason => {
            setResult({
                status: "rejected",
                reason,
            })
        })
    }, [
        options.promise
    ])
    useEffect(() => {
        if (isFirstMount && options.defer !== undefined) {
            return
        }
        retry()
    }, [
        retry
    ])
    return {
        ...state,
        retry
    }
}

export type AsyncLazyState<D> = LazyState<D> & { readonly retry: Retry }

export interface AsyncifiedOptions<D, P> extends AsyncOptions<D>, LazyHOCOptions<AsyncLazyState<D>, P> {
}

export function asyncified<I extends {}, D extends {}, P extends {}>(factory: (props: I) => AsyncifiedOptions<D, P>) {
    return lazified((props: I) => {
        const options = factory(props)
        const event = useAsyncLazy(options)
        return {
            event,
            passthrough: state => callOrGet(options.passthrough, { ...state, retry: event.retry }),
            overrides: options.overrides,
        }
    })
}

type Retry = () => void

export interface AsyncifiedProps<D> extends AsyncOptions<D> {

    readonly children: ValueOrFactory<ReactNode, [D, AsyncLazyState<D>]>

    /**
     * The lazy overrides.
     */
    readonly overrides?: LazyOverrides | undefined

}

export const Asyncified = <D,>(props: AsyncifiedProps<D>) => {
    const event = useAsyncLazy(props)
    return <Lazy event={event}
        overrides={props.overrides}
        children={(value, state) => callOrGet(props.children, value, { ...state, retry: event.retry })} />
}
