
import { ReactNode, useEffect, useState } from "react"
import { Observable } from "rxjs"
import { Lazy, LazyEvent, LazyOverrides, LazyState, lazified, useLazyState } from "."

export function useObservableLazy<D>(observable: Observable<D>) {
    const [result, setResult] = useState<LazyEvent<D>>(() => {
        return {
            status: "loading"
        }
    })
    useEffect(() => {
        const sub = observable.subscribe({
            next: value => {
                setResult({
                    status: "fulfilled",
                    value
                })
            },
            error: reason => {
                setResult({
                    status: "rejected",
                    reason
                })
            }
        })
        return () => {
            sub.unsubscribe()
            setResult({
                status: "loading"
            })
        }
    }, [
        observable
    ])
    return useLazyState(result)
}

export type ObservingOptions<D> = {
    readonly of: Observable<D>
    readonly overrides?: LazyOverrides
}

export function observing<I extends {}, D, K extends string>(key: K, factory: (props: I) => ObservingOptions<D>) {
    return lazified(key, (props: I) => {
        const options = factory(props)
        return {
            state: useObservableLazy(options.of),
            overrides: options.overrides,
        }
    })
}

export type ObservingProps<D> = ObservingOptions<D> & {

    readonly children: (value: D, state: LazyState<D>) => ReactNode

}

export const Observing = <D,>(props: ObservingProps<D>) => {
    const state = useObservableLazy(props.of)
    return <Lazy state={state}
        overrides={props.overrides}
        children={value => props.children(value, state)} />
}
