
import { ReactNode, useEffect, useState } from "react"
import { Observable } from "rxjs"
import { Lazy, LazyEvent, LazyOverrides, lazified } from "."

export interface ObservableLazyOptions<D> {

    readonly of: Observable<D>

}

export function useObservableLazy<D>(options: ObservableLazyOptions<D>) {
    const [event, setEvent] = useState<LazyEvent<D>>({ status: "loading" as const })
    useEffect(() => {
        setEvent({
            status: "loading"
        })
        const sub = options.of.subscribe({
            next: value => {
                setEvent({
                    status: "fulfilled",
                    value
                })
            },
            error: reason => {
                setEvent({
                    status: "rejected",
                    reason
                })
            }
        })
        return () => {
            sub.unsubscribe()
        }
    }, [
        options.of
    ])
    return event
}

export interface ObservingOptions<D> extends ObservableLazyOptions<D> {

    readonly overrides?: LazyOverrides | undefined

}

export function observing<I extends {}, D, K extends string>(key: K, factory: (props: I) => ObservingOptions<D>) {
    return lazified(key, (props: I) => {
        const options = factory(props)
        const event = useObservableLazy(options)
        return {
            event,
            overrides: options.overrides,
        }
    })
}

export interface ObservingProps<D> extends ObservingOptions<D> {

    readonly children: (value: D) => ReactNode

}

export const Observing = <D,>(props: ObservingProps<D>) => {
    const event = useObservableLazy(props)
    return <Lazy event={event}
        overrides={props.overrides}
        children={value => props.children(value)} />
}
