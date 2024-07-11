
import { ReactNode, useEffect, useState } from "react"
import { Observable } from "rxjs"
import { Lazy, LazyEvent, LazyOverrides, lazified2 } from "."

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

export interface ObservingOptions<D, P> extends ObservableLazyOptions<D> {

    readonly passthrough?: P | undefined
    readonly overrides?: LazyOverrides | undefined

}

export function observing<I extends {}, D extends {}, P extends {}>(factory: (props: I) => ObservingOptions<D, P>) {
    return lazified2((props: I) => {
        const options = factory(props)
        const event = useObservableLazy(options)
        return {
            event,
            passthrough: options.passthrough,
            overrides: options.overrides,
        }
    })
}

export interface ObservingProps<D> extends ObservableLazyOptions<D> {

    readonly children: (value: D) => ReactNode
    readonly overrides?: LazyOverrides | undefined

}

export const Observing = <D,>(props: ObservingProps<D>) => {
    const event = useObservableLazy(props)
    return <Lazy event={event}
        overrides={props.overrides}
        children={value => props.children(value)} />
}
