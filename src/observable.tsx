
import { ReactNode, useEffect, useState } from "react"
import { Observable } from "rxjs"
import { Lazy, LazyOverrides, LazyState, lazified } from "."
import { LazyMeta } from "./meta"

export function useObservableLazy<D>(observable: Observable<D>) {
    const [result, setResult] = useState<LazyState<D>>(() => {
        return {
            status: "loading"
        }
    })
    useEffect(() => {
        const sub = observable.subscribe({ next: value => setResult({ status: "fulfilled", value }), error: reason => setResult({ status: "rejected", reason }) })
        return () => {
            sub.unsubscribe()
            setResult({
                status: "loading"
            })
        }
    }, [
        observable
    ])
    return result
}

export type ObservingOptions<D> = { of: Observable<D>, overrides?: LazyOverrides, props?: number }

export function observing<I extends {}, D, K extends string>(key: K, factory: (props: I) => ObservingOptions<D>) {
    return lazified(key, (props: I) => {
        const options = factory(props)
        return {
            state: useObservableLazy(options.of),
            overrides: options.overrides,
        }
    })
}

export type ObservingProps<D> = {

    of: Observable<D>,
    overrides?: LazyOverrides
    children: (value: D, meta: LazyMeta<D>) => ReactNode

}

export const Observing = <D,>(props: ObservingProps<D>) => {
    return <Lazy state={useObservableLazy(props.of)}
        overrides={props.overrides}
        children={props.children} />
}
