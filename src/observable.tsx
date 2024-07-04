
import { ReactNode, useEffect, useState } from "react"
import { Observable } from "rxjs"
import { Lazy, LazyEvent, LazyOverrides, LazyState, lazified } from "."

export interface ObservableLazyOptions<D> {

    readonly of: Observable<D>
    readonly prefill?: LazyEvent<D> | undefined

}

export function useObservableLazy<D>(options: ObservableLazyOptions<D>) {
    const [event, setEvent] = useState<LazyEvent<D>>(options.prefill ?? { status: "loading" })
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
            events: event,
            overrides: options.overrides,
        }
    })
}

export interface ObservingProps<D> extends ObservingOptions<D> {

    readonly children: (value: D, state: LazyState<D>) => ReactNode

}

export const Observing = <D,>(props: ObservingProps<D>) => {
    const event = useObservableLazy(props)
    return <Lazy events={event}
        overrides={[props.overrides]}
        children={(value, state) => props.children(value, state)} />
}
