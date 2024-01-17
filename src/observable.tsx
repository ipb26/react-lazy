
import { ReactNode, useEffect, useState } from "react"
import { Observable } from "rxjs"
import { Lazy, LazyEvent, LazyOverrides, LazyState, lazified } from "."

export function useObservableLazy<D>(observable: Observable<D>) {
    const [event, setEvent] = useState<LazyEvent<D>>({
        status: "loading"
    })
    useEffect(() => {
        setEvent({
            status: "loading"
        })
        const sub = observable.subscribe({
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
        observable
    ])
    return event
}

export interface ObservingOptions<D> {

    readonly of: Observable<D>
    readonly overrides?: LazyOverrides

}

export function observing<I extends {}, D, K extends string>(key: K, factory: (props: I) => ObservingOptions<D>) {
    return lazified(key, (props: I) => {
        const options = factory(props)
        const event = useObservableLazy(options.of)
        return {
            events: event,
            overrides: options.overrides,
        }
    })
}

export type ObservingProps<D> = ObservingOptions<D> & {

    readonly children: (value: D, state: LazyState<D>) => ReactNode

}

export const Observing = <D,>(props: ObservingProps<D>) => {
    const event = useObservableLazy(props.of)
    return <Lazy events={event}
        overrides={[props.overrides]}
        children={(value, state) => props.children(value, state)} />
}
