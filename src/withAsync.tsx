
import { AsyncOptions, AsyncState, PromiseFn, useAsync } from "react-async"
import { LazyOverrides, withLazy, withLazyAs } from "./"
import { addKeyToPromiseResult } from "./internal"

function toPromiseResult<D>(state: AsyncState<D>) {
    if (state.isFulfilled) {
        return {
            status: state.status,
            value: state.data
        }
    }
    else if (state.isRejected) {
        return {
            status: state.status,
            reason: state.error
        }
    }
}

export function useAsyncAsPromiseResult<D>(options: PromiseFn<D> | AsyncOptions<D>) {
    const state = useAsync(options)
    if (state.isFulfilled) {
        return {
            status: state.status,
            value: state.data
        }
    }
    else if (state.isRejected) {
        return {
            status: state.status,
            reason: state.error
        }
    }
}
export function useAsyncAsStatePromiseResult<D>(options: PromiseFn<D> | AsyncOptions<D>) {
    const state = useAsync(options)
    if (state.isFulfilled) {
        return {
            status: state.status,
            value: state
        }
    }
    else if (state.isRejected) {
        return {
            status: state.status,
            reason: state.error
        }
    }
}

export function withAsync<I extends {}, D extends {}>(build: (props: I) => PromiseFn<D> | AsyncOptions<D>, overrides: LazyOverrides<I> = {}) {
    return withLazy((props: I) => ({ result: useAsyncAsPromiseResult(build(props)), pass: {} }), overrides)
}

export function withAsyncAs<I extends {}, D, K extends string>(key: K, build: (props: I) => PromiseFn<D> | AsyncOptions<D>, overrides: LazyOverrides<I> = {}) {
    return withLazy((props: I) => ({ result: addKeyToPromiseResult(key, useAsyncAsPromiseResult(build(props))), pass: {} }), overrides)
}

export function withAsyncState<I extends {}, D, K extends string>(key: K, build: (props: I) => PromiseFn<D> | AsyncOptions<D>, overrides: LazyOverrides<I & Record<K, AsyncState<D>>> = {}) {
    return withLazyAs(key, (props: I) => {
        const state = useAsyncAsStatePromiseResult(build(props))
        return {
            result: addKeyToPromiseResult(key, state),
            pass: { [key]: state } as Record<K, AsyncState<D>>
        }
    }, overrides)
}
