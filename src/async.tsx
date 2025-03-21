
import { ReactNode, useCallback, useEffect, useState } from "react"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { Lazy, LazyEvent, LazyOverrides, lazified } from "."
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

}

export function useAsyncLazy<D>(options: AsyncOptions<D> | (() => PromiseLike<D>)) {
    const [promise, setPromise] = useState<PromiseLike<D>>()
    const [state, setResult] = useState<LazyEvent<D>>({ status: "loading" })
    const promiseOption = typeof options === "function" ? options : options.promise
    const run = useCallback(() => setPromise(callOrGet(promiseOption)), [promiseOption])
    const firstMount = useIsFirstMount()
    useEffect(() => {
        if (firstMount) {
            run()
        }
    }, [
        run
    ])
    useEffect(() => {
        if (promise !== undefined) {
            setResult({
                status: "loading",
            })
            promise.then(value => {
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
        }
    }, [
        promise
    ])
    return {
        ...state,
        retry: run,
    }
}

export interface AsyncifiedOptions<D, P> extends AsyncOptions<D> {

    readonly passthrough: P
    readonly overrides?: LazyOverrides | undefined

}

export function asyncified<I extends {}, D extends {}, P extends {}>(factory: (props: I) => AsyncifiedOptions<D, P>) {
    return lazified((props: I) => {
        const options = factory(props)
        const event = useAsyncLazy(options)
        return {
            event,
            passthrough: options.passthrough,
            overrides: options.overrides,
        }
    })
}

type Retry = () => void

export interface AsyncifiedProps<D> extends AsyncOptions<D> {

    readonly children: ValueOrFactory<ReactNode, [D, boolean, Retry]>

    /**
     * The lazy overrides.
     */
    readonly overrides?: LazyOverrides | undefined

}

export const Asyncified = <D,>(props: AsyncifiedProps<D>) => {
    const event = useAsyncLazy(props)
    return <Lazy event={event}
        overrides={props.overrides}
        children={(value, reloading) => callOrGet(props.children, value, reloading, event.retry)} />
}
