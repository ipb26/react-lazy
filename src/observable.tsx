
import { ReactNode, useEffect, useState } from "react"
import { Observable } from "rxjs"
import { Lazy, LazyOverrides, LazyResult, LazyState, lazified } from "."

export function useObservable<D>(observable: Observable<D>, prefill?: D) {
    const [result, setResult] = useState<LazyState<D>>({ status: "loading" })
    useEffect(() => {
        if (prefill === undefined) {
            const sub = observable.subscribe({ next: value => setResult({ status: "fulfilled", value }), error: reason => setResult({ status: "rejected", reason }) })
            return () => {
                setResult({ status: "loading" })
                sub.unsubscribe()
            }
        }
    }, [observable])
    if (prefill === undefined) {
        return result
    }
    return {
        status: "fulfilled" as const,
        value: prefill
    }
}

export type ObservingOptions<D, P extends {}> = { of: Observable<D>, overrides?: LazyOverrides, props?: P }

export function observing<I extends {}, D, K extends string, P extends {}>(key: K, factory: (props: I) => ObservingOptions<D, P>) {
    return lazified(key, (props: I & { prefill?: D }) => {
        const options = factory(props)
        return {
            state: useObservable(options.of, props.prefill),
            overrides: options.overrides,
            props: options.props,
        }
    })
}

export type ObservingProps<D> = {
    of: Observable<D>,
    overrides?: LazyOverrides
    children: (result: LazyResult<D>) => ReactNode
}
export const Observing = <D,>(props: ObservingProps<D>) => {
    return <Lazy state={useObservable(props.of)}
        overrides={props.overrides}
        children={props.children} />
}
