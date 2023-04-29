
import { useCallback, useEffect, useState } from "react"
import { ValueOrFactory, callOrGet } from "value-or-factory"
import { LazyOverrides, LazyState, lazified } from "."

export type AsyncOptions<D> = {
    promise(): Promise<D>
    cleanup?(value: D): void
    initial?: {
        defer?: boolean
        value: D
    }
}
export type AsyncState<D> = {
    value: D
    run(): void
}

export function useAsync<D>(options: AsyncOptions<D>): LazyState<AsyncState<D>> {
    const [promise, setPromise] = useState<Promise<D>>()
    const [result, setResult] = useState<PromiseSettledResult<D> | undefined>(options.initial !== undefined ? { status: "fulfilled", value: options.initial.value } : undefined)
    const run = useCallback(async () => {
        const promise = options.promise()
        setPromise(promise)
        return promise.then(() => void 0, () => void 0)
    }, [options.promise])
    useEffect(() => {
        if (options.initial?.defer !== true) {
            run()
        }
    }, [run, options.initial?.defer])
    useEffect(() => {
        if (promise !== undefined) {
            promise.then(value => setResult({ status: "fulfilled", value }), reason => setResult({ status: "rejected", reason }))
            return () => {
                promise.then(options.cleanup)
            }
        }
    }, [promise, options.cleanup])
    if (result === undefined) {
        return {
            status: "loading"
        }
    }
    else if (result.status === "rejected") {
        return {
            status: "rejected",
            reason: result.reason,
            retry: run,
        }
    }
    return {
        status: "fulfilled",
        value: {
            value: result.value,
            run
        }
    }
}

export type AsyncifiedOptions<D, P extends {} = {}> = AsyncOptions<D> & { overrides?: ValueOrFactory<LazyOverrides, [LazyState<AsyncState<D>>]>, props?: P }

export function asyncified<I extends {}, D, K extends string, P extends {}>(key: K, factory: (props: I) => AsyncifiedOptions<D, P>) {
    return lazified(key, (props: I) => {
        const options = factory(props)
        const state = useAsync(options)
        return {
            state,
            overrides: callOrGet(options.overrides, state),
            props: options.props
        }
    })
}

/*
export type AsyncState<D> = ({
    status: "loading"
} | {
    status: "fulfilled"
    value: D
} | {
    status: "rejected"
    reason: unknown
}) & {
    run(): void
}

export function useAsyncData<D>(options: AsyncOptions<D>) {
    const result = useAsync(options)
    if (result.status !== "fulfilled") {
        return result
    }
    return {
        status: result.status,
        value: result.value.data
    }
}*/
/*
export function withAsync<I extends {}, D extends {}, P extends {}>(factory: (props: I) => WithAsyncOptions<D, D, P>) {
    return withLazy((props: I) => {
        const options = factory(props)
        const state = useAsyncData(options)
        return {
            state,
            overrides: callOrGet(options.overrides, state),
            props: options.props
        }
    })
}

export function withAsyncAs<I extends {}, D, K extends string, P extends {} = {}>(key: K, factory: (props: I) => WithAsyncOptions<D, D, P>) {
    return withLazyAs(key, (props: I) => {
        const options = factory(props)
        const state = useAsyncData(options)
        return {
            state,
            overrides: callOrGet(options.overrides, state),
            props: options.props
        }
    })
}
*/