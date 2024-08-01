
import { ReactNode, useCallback, useEffect, useState } from "react"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { Lazy, LazyEvent, LazyOverrides, lazified } from "."

/**
 * Options for the async hook.
 * @typeParam D The data type.
 */
export type AsyncOptions<D> = {

    /**
     * A function that returns a promise. This MUST be memoized - it will re-run every time a new value is received. Use the useCallback hook.
     */
    readonly promise: ValueOrFactory<PromiseLike<D>>

}

export function useAsyncLazy<D>(options: AsyncOptions<D>) {
    const [promise, setPromise] = useState<PromiseLike<D>>()
    const [state, setResult] = useState<LazyEvent<D>>(() => {
        return {
            status: "loading",
        }
    })
    const run = useCallback(async () => setPromise(callOrGet(options.promise)), [options.promise])
    useEffect(() => {
        run()
    }, [
        run
    ])
    useEffect(() => {
        if (promise !== undefined) {
            setResult({
                status: "loading"
            })
            promise.then(value => {
                setResult({
                    status: "fulfilled",
                    value
                })
            }, reason => {
                setResult({
                    status: "rejected",
                    reason,
                    retry: run,
                })
            })
        }
    }, [
        promise
    ])
    return state
}

export interface AsyncifiedOptions<D, P> extends AsyncOptions<D> {

    readonly passthrough?: P | undefined
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

export type AsyncifiedProps<D> = AsyncOptions<D> & {

    readonly children: (value: D) => ReactNode
    readonly overrides?: LazyOverrides | undefined

}

export const Asyncified = <D,>(props: AsyncifiedProps<D>) => {
    const event = useAsyncLazy(props)
    return <Lazy event={event}
        overrides={props.overrides}
        children={value => props.children(value)} />
}
