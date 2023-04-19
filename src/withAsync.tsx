
import { AsyncFulfilled, AsyncInitial, AsyncPending, AsyncRejected, AsyncState, AsyncOptions as OldAsyncOptions, PromiseFn, useAsync } from "react-async"
import { ErrorProps, LazyOverrides, LazyResult, withLazy } from "./"
import { addKeyToPromiseResult } from "./internal"

export type AsyncOptions<D> = OldAsyncOptions<D> & { cleanupFn?: (value: D) => void }

export type AsyncLoadingProps<D> = Omit<AsyncPending<D> | AsyncInitial<D>, "status">
export type AsyncErrorProps<D> = AsyncRejected<D> & ErrorProps

export function useAsyncLazyResult<D>(state: AsyncState<D>): LazyResult<D, AsyncLoadingProps<D>, AsyncErrorProps<D>> {
    if (state.isFulfilled) {
        return { status: "fulfilled", value: state.data }
    }
    else if (state.isRejected) {
        return { status: "rejected", props: { ...state, reason: state.error, retry: state.reload } }
    }
    else {
        return { ...state, status: "loading" as const }
    }
}
export function useAsyncStateLazyResult<D>(state: AsyncState<D>): LazyResult<AsyncFulfilled<D>, AsyncLoadingProps<D>, AsyncErrorProps<D>> {
    if (state.isFulfilled) {
        return { status: "fulfilled", value: state }
    }
    else if (state.isRejected) {
        return { status: "rejected", props: { ...state, reason: state.error, retry: state.reload } }
    }
    else {
        return { ...state, status: "loading" as const }
    }
}

export type WithAsyncOptions<D> = (PromiseFn<D> | (AsyncOptions<D> & { cleanupFn?: (value: D) => void })) & { overrides?: LazyOverrides<AsyncLoadingProps<D>, AsyncErrorProps<D>> }

export function withAsync<I extends {}, D extends {}>(factory: (props: I) => WithAsyncOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        const state = useAsync(options)
        return {
            result: useAsyncLazyResult(state),
            overrides: options.overrides
        }
    })
}

export function withAsyncAs<I extends {}, D, K extends string>(key: K, factory: (props: I) => WithAsyncOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        const state = useAsync(options)
        const result = useAsyncLazyResult(state)
        return {
            result: addKeyToPromiseResult(key, result),
            overrides: options.overrides
        }
    })
}

export function withAsyncState<I extends {}, D, K extends string>(key: K, factory: (props: I) => WithAsyncOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        const state = useAsync(options)
        return {
            result: addKeyToPromiseResult(key, useAsyncStateLazyResult(state)),
            overrides: options.overrides
        }
    })
}
