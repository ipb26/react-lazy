
import { useEffect, useState } from "react"
import { Observable } from "rxjs"
import { LazyOverrides, LazyResult, withLazy } from "./"
import { addKeyToPromiseResult } from "./internal"

export function useObservableLazyResult<D>(observable: Observable<D>) {
    const [result, setResult] = useState<LazyResult<D>>({ status: "loading" })
    useEffect(() => {
        const sub = observable.subscribe({ next: value => setResult({ status: "fulfilled", value }), error: reason => setResult({ status: "rejected", props: { reason } }) })
        return () => {
            sub.unsubscribe()
        }
    }, [observable])
    return result
}

export function useResultObservableLazyResult<D>(observable: Observable<PromiseSettledResult<D> | undefined>) {
    const [result, setResult] = useState<LazyResult<D>>({ status: "loading" })
    useEffect(() => {
        const sub = observable.subscribe({ next: value => setResult(value ?? { status: "loading" }), error: reason => setResult({ status: "rejected", reason }) })
        return () => {
            sub.unsubscribe()
        }
    }, [observable])
    return result
}

type WithObservableOptions<D> = {
    of: Observable<D>
    overrides?: LazyOverrides
}

export function withObservable<I extends {}, D extends {}>(factory: (props: I) => WithObservableOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        return {
            result: useObservableLazyResult(options.of),
            overrides: options.overrides
        }
    })
}

export function withResultObservable<I extends {}, D extends {}>(factory: (props: I) => WithObservableOptions<PromiseSettledResult<D> | undefined>) {
    return withLazy((props: I) => {
        const options = factory(props)
        return {
            result: useResultObservableLazyResult(options.of),
            overrides: options.overrides
        }
    })
}

export function withObservableAs<I extends {}, D, K extends string>(key: K, factory: (props: I) => WithObservableOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        return {
            result: addKeyToPromiseResult(key, useObservableLazyResult(options.of)),
            overrides: options.overrides
        }
    })
}

export function withResultObservableAs<I extends {}, D, K extends string>(key: K, factory: (props: I) => WithObservableOptions<PromiseSettledResult<D> | undefined>) {
    return withLazy((props: I) => {
        const options = factory(props)
        return {
            result: addKeyToPromiseResult(key, useResultObservableLazyResult(options.of)),
            overrides: options.overrides
        }
    })
}
