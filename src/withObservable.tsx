
import { useEffect, useState } from "react"
import { Observable } from "rxjs"
import { LazyOverrides, withLazy } from "./"
import { addKeyToPromiseResult } from "./internal"

export function useObservableLazy<D>(observable: Observable<D>) {
    const [result, setResult] = useState<PromiseSettledResult<D>>()
    useEffect(() => {
        const sub = observable.subscribe({ next: value => setResult({ status: "fulfilled", value }), error: reason => setResult({ status: "rejected", reason }) })
        return () => {
            sub.unsubscribe()
        }
    }, [observable])
    return result
}

export function useObservableAsLazy<K extends string, D>(key: K, observable: Observable<D>) {
    return addKeyToPromiseResult(key, useObservableLazy(observable))
}

export function useObservableResultLazy<D>(observable: Observable<PromiseSettledResult<D> | undefined>) {
    const [result, setResult] = useState<PromiseSettledResult<D>>()
    useEffect(() => {
        const sub = observable.subscribe({ next: value => setResult(value), error: reason => setResult({ status: "rejected", reason }) })
        return () => {
            sub.unsubscribe()
        }
    }, [observable])
    return result
}

export function useObservableResultAsLazy<K extends string, D>(key: K, observable: Observable<PromiseSettledResult<D> | undefined>) {
    return addKeyToPromiseResult(key, useObservableResultLazy(observable))
}

type WithObservableOptions<D> = {
    of: Observable<D>
    overrides?: LazyOverrides
}

export function withObservable<I extends {}, D extends {}>(factory: (props: I) => WithObservableOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        return {
            result: useObservableLazy(options.of),
            overrides: options.overrides
        }
    })
}

export function withObservableResult<I extends {}, D extends {}>(factory: (props: I) => WithObservableOptions<PromiseSettledResult<D> | undefined>) {
    return withLazy((props: I) => {
        const options = factory(props)
        return {
            result: useObservableResultLazy(options.of),
            overrides: options.overrides
        }
    })
}

export function withObservableAs<I extends {}, D, K extends string>(key: K, factory: (props: I) => WithObservableOptions<D>) {
    return withLazy((props: I) => {
        const options = factory(props)
        return {
            result: useObservableAsLazy(key, options.of),
            overrides: options.overrides
        }
    })
}

export function withObservableResultAs<I extends {}, D, K extends string>(key: K, factory: (props: I) => WithObservableOptions<PromiseSettledResult<D> | undefined>) {
    return withLazy((props: I) => {
        const options = factory(props)
        return {
            result: useObservableResultAsLazy(key, options.of),
            overrides: options.overrides
        }
    })
}
