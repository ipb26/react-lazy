
import { ComponentType, ReactNode, createElement, useCallback, useEffect, useState } from "react"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { Lazy, LazyEvent, LazyOverrides } from "."
import { KeyProps, addProps } from "./internal"

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

export interface AsyncValue<D> {

    readonly value: D
    run(): void
}

//TODO private
export function useAsync<D>(options: AsyncOptions<D>) {
    const [promise, setPromise] = useState<PromiseLike<D>>()
    const [state, setResult] = useState<LazyEvent<AsyncValue<D>>>(() => {
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
                    value: {
                        value,
                        run
                    }
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

export function useAsyncLazy<D>(options: AsyncOptions<D>) {
    return useAsync(options)
}

export type AsyncifiedPass<K extends string, D> = KeyProps<K, AsyncValue<D>>

export interface AsyncifiedOptions<D> extends AsyncOptions<D> {

    readonly overrides?: ValueOrFactory<LazyOverrides, []> | undefined

}

export function asyncified<I extends {}, D, K extends string>(key: K, factory: (props: I) => AsyncifiedOptions<D>) {
    return (component: ComponentType<I & AsyncifiedPass<K, D>>) => {
        return (props: I) => {
            const options = factory(props)
            const event = useAsyncLazy(options)
            const overrides = callOrGet(options.overrides)
            return <Lazy event={event}
                overrides={[overrides]}
                children={value => createElement(component, { ...props, ...addProps(key, value) })} />
        }
    }
}

export type AsyncifiedProps<D> = AsyncifiedOptions<D> & {

    readonly children: (value: AsyncValue<D>) => ReactNode

}

export const Asyncified = <D,>(props: AsyncifiedProps<D>) => {
    const event = useAsyncLazy(props)
    return <Lazy event={event}
        overrides={[callOrGet(props.overrides)]}
        children={value => props.children(value)} />
}
