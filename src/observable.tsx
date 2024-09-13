
import { ReactNode, useEffect, useState } from "react"
import { combineLatest, isObservable, Observable, ObservableInput, ObservedValueOf } from "rxjs"
import { lazified, Lazy, LazyEvent, LazyOverrides } from "."

//
export type ObservableLazyInput = Observable<any> | Record<string, ObservableInput<any>>
export type ObservableLazyOutput<X extends ObservableLazyInput> = X extends Observable<any> ? ObservedValueOf<X> : { [K in keyof X]: ObservedValueOf<X[K]> }

export interface ObservableLazyOptions<D extends ObservableLazyInput> {

    readonly of: D

}

function proc<X extends ObservableLazyInput>(d: X): Observable<ObservableLazyOutput<X>> {
    if (!isObservable(d)) {
        //@ts-ignore
        return combineLatest(d)
    }
    //@ts-ignore
    return d
}

export function useObservableLazy<D extends ObservableLazyInput>(options: ObservableLazyOptions<D>) {
    const [event, setEvent] = useState<LazyEvent<ObservableLazyOutput<D>>>({ status: "loading" as const })
    useEffect(() => {
        setEvent({
            status: "loading"
        })
        const observable = proc(options.of)
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

export interface ObservingOptions<D extends ObservableLazyInput, P> extends ObservableLazyOptions<D> {

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

export interface ObservingProps<D extends ObservableLazyInput> extends ObservableLazyOptions<D> {

    readonly children: (value: ObservableLazyOutput<D>) => ReactNode
    readonly overrides?: LazyOverrides | undefined

}

export const Observing = <D extends ObservableLazyInput>(props: ObservingProps<D>) => {
    const event = useObservableLazy(props)
    return <Lazy event={event}
        overrides={props.overrides}
        children={value => props.children(value)} />
}
