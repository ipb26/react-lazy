
import { useEffect, useState } from "react"
import { Observable } from "rxjs"
import { LazyOverrides, withLazy } from "./"
import { addKeyToPromiseResult } from "./internal"

export function useObservableAsPromiseResult<D>(observable: Observable<D>) {
    const [result, setResult] = useState<PromiseSettledResult<D>>()
    useEffect(() => {
        const sub = observable.subscribe({ next: value => setResult({ status: "fulfilled", value }), error: reason => setResult({ status: "rejected", reason }) })
        return () => {
            sub.unsubscribe()
        }
    }, [observable])
    return result
}

export function withObservable<I extends {}, D extends {}>(factory: (props: I) => Observable<D>, overrides: LazyOverrides<I> = {}) {
    return withLazy((props: I) => ({ result: useObservableAsPromiseResult(factory(props)), pass: {} }), overrides)
}

export function withObservableAs<I extends {}, D, K extends string>(key: K, factory: (props: I) => Observable<D>, overrides: LazyOverrides<I> = {}) {
    return withLazy((props: I) => ({ result: addKeyToPromiseResult(key, useObservableAsPromiseResult(factory(props))), pass: {} }), overrides)
}
