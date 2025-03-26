
import { ReactNode, useCallback, useEffect, useState } from "react"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { Lazy, LazyEvent, LazyOverrides, LazyState, lazified } from "."

/**
 * Options for the async hook.
 * @typeParam D The data type.
 */
export type AsyncOptions<D> = {

    /**
     * A promise or a function that returns a promise. This MUST be memoized - the function will re-run every time a new value is received.
     */
    readonly promise: ValueOrFactory<PromiseLike<D>>

}

export function useAsyncLazy<D>(options: AsyncOptions<D> | (() => PromiseLike<D>)) {
    const promise = typeof options === "function" ? options : options.promise
    const [state, setResult] = useState<LazyEvent<D>>({ status: "loading" })
    const retry = useCallback(() => {
        setResult({
            status: "loading"
        })
        callOrGet(promise).then(value => {
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
        promise
    ])
    useEffect(() => {
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

export interface AsyncifiedOptions<D, P> extends AsyncOptions<D> {

    readonly passthrough: ValueOrFactory<P, [AsyncLazyState<D>]>
    readonly overrides?: LazyOverrides | undefined

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
