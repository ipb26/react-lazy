
import { AsyncFulfilled, AsyncOptions, AsyncState, PromiseFn, useAsync } from "react-async"
import { LazyOverrides, withLazy } from "./"

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

export function useAsyncLazy<D>(options: PromiseFn<D> | AsyncOptions<D>) {
    const state = useAsync(options)
    return {
        result: toPromiseResult(state),
        pass: {
        }
    }
}

function toPromiseResult2<D, K extends string>(key: K, state: AsyncState<D>) {
    if (state.isFulfilled) {
        return {
            status: state.status,
            value: { [key]: state } as Record<K, AsyncFulfilled<D>>
        }
    }
    else if (state.isRejected) {
        return {
            status: state.status,
            reason: state.error
        }
    }
}

export function useAsyncLazy2<D, K extends string>(key: K, options: PromiseFn<D> | AsyncOptions<D>) {
    const state = useAsync(options)
    return {
        result: toPromiseResult2(key, state),
        pass: { [key]: state } as Record<K, AsyncState<D>>
    }
}

export function withAsync<I extends {}, D extends {}>(build: (props: I) => PromiseFn<D> | AsyncOptions<D>, overrides: LazyOverrides<I> = {}) {
    return withLazy((props: I) => useAsyncLazy(build(props)), overrides)
}

export function withAsyncState<I extends {}, D, K extends string>(key: K, build: (props: I) => PromiseFn<D> | AsyncOptions<D>, overrides: LazyOverrides<I & Record<K, AsyncState<D>>> = {}) {
    return withLazy((props: I) => useAsyncLazy2(key, build(props)), overrides)
}
