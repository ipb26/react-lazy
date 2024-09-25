
import { ReactNode, useState } from "react"
import { Observable, ObservedValueOf } from "rxjs"
import { useDeepCompareEffect } from "state-hooks"
import { lazified, Lazy, LazyEvent, LazyOverrides } from "."

//
export type ObservableLazyInput = Observable<any>// | Record<string, ObservableInput<any>>
export type ObservableLazyOutput<X extends ObservableLazyInput> = X extends Observable<any> ? ObservedValueOf<X> : { [K in keyof X]: ObservedValueOf<X[K]> }

export interface ObservableLazyOptions<D> {

    readonly of: Observable<D>

}

export function useObservableLazy<D>(options: ObservableLazyOptions<D>) {
    const [event, setEvent] = useState<LazyEvent<D>>({ status: "loading" as const })
    useDeepCompareEffect(() => {
        setEvent({
            status: "loading"
        })
        const observable = options.of
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
        options.of
    ])
    return event
}

export interface ObservingOptions<D, P> extends ObservableLazyOptions<D> {

    readonly passthrough?: P | undefined
    readonly overrides?: LazyOverrides | undefined

}

export function observing<I extends {}, D extends {}, P extends {}>(factory: (props: I) => ObservingOptions<D, P>) {
    return lazified((props: I) => {
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
