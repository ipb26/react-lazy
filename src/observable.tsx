
import { useEffect, useState } from "react"
import { Observable } from "rxjs"
import { LazyOverrides, LazyState, lazified } from "."

export function useObservable<D>(observable: Observable<D>) {
    const [result, setResult] = useState<LazyState<D>>({ status: "loading" })
    useEffect(() => {
        const sub = observable.subscribe({ next: value => setResult({ status: "fulfilled", value }), error: reason => setResult({ status: "rejected", reason }) })
        return () => {
            sub.unsubscribe()
        }
    }, [observable])
    return result
}

type ObservingOptions<D, P extends {}> = { of: Observable<D>, overrides?: LazyOverrides, props?: P }

export function observing<I extends {}, D, K extends string, P extends {}>(key: K, factory: (props: I) => ObservingOptions<D, P>) {
    return lazified(key, (props: I) => {
        const options = factory(props)
        return {
            state: useObservable(options.of),
            overrides: options.overrides,
            props: options.props,
        }
    })
}
