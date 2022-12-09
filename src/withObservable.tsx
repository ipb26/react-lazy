
import { useEffect, useState } from "react"
import { Observable } from "rxjs"
import { LazyOverrides, withLazy } from "./"

export function useObservableLazy<D>(observable: Observable<D>) {
    const [result, setResult] = useState<PromiseSettledResult<D>>()
    useEffect(() => {
        const sub = observable.subscribe({ next: value => setResult({ status: "fulfilled", value }), error: reason => setResult({ status: "rejected", reason }) })
        return () => {
            sub.unsubscribe()
        }
    }, [observable])
    return {
        result,
        pass: {}
    }
}

export function withObservable<I extends {}, D extends {}>(factory: (props: I) => Observable<D>, overrides: LazyOverrides<I> = {}) {
    return withLazy((props: I) => useObservableLazy(factory(props)), overrides)
}
