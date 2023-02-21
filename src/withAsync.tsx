
import { useEffect } from "react"
import { AsyncOptions, AsyncState, PromiseFn, useAsync as useAsyncFromReactAsync } from "react-async"
import { LazyOverrides, withLazy } from "./"
import { addKeyToPromiseResult } from "./internal"

export function useAsync<D>(options: PromiseFn<D> | (AsyncOptions<D> & { cleanupFn?: (value: D) => void })) {
    const state = useAsyncFromReactAsync(options)
    useEffect(() => {
        if (state.isResolved) {
            return () => {
                if (typeof options === "object") {
                    options.cleanupFn?.(state.data)
                }
            }
        }
    }, [state.isResolved])
    return state
}

export function asyncStateToDataLazy<D>(state: AsyncState<D>) {
    if (state.isFulfilled) {
        return { status: state.status, value: state.data }
    }
    else if (state.isRejected) {
        return { status: state.status, reason: state.error, retry: state.reload }
    }
}
export function asyncStateToStateLazy<D>(state: AsyncState<D>) {
    if (state.isFulfilled) {
        return { status: state.status, value: state }
    }
    else if (state.isRejected) {
        return { status: state.status, reason: state.error, retry: state.reload }
    }
}

export type WithAsyncOptions<D> = (PromiseFn<D> | (AsyncOptions<D> & { cleanupFn?: (value: D) => void })) & { overrides?: LazyOverrides }

export function withAsync<I extends {}, D extends {}>(factory: (props: I) => WithAsyncOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        const state = useAsync(options)
        return {
            result: asyncStateToDataLazy(state),
            overrides: options.overrides
        }
    })
}

export function withAsyncAs<I extends {}, D, K extends string>(key: K, factory: (props: I) => WithAsyncOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        const state = useAsync(options)
        return {
            result: addKeyToPromiseResult(key, asyncStateToDataLazy(state)),
            overrides: options.overrides
        }
    })
}

export function withAsyncState<I extends {}, D, K extends string>(key: K, factory: (props: I) => WithAsyncOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        const state = useAsync(options)
        return {
            result: addKeyToPromiseResult(key, asyncStateToStateLazy(state)),
            overrides: options.overrides
        }
    })
}
