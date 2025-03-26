
import { ComponentType, createElement } from "react"
import { callOrGet, ValueOrFactory } from "value-or-factory"
import { Lazy, LazyEvent, LazyOverrides, LazyState } from "."

export type LazyBuilder<D, P> = {

    readonly event: LazyEvent<D>
    readonly passthrough: ValueOrFactory<P, [LazyState<D>]>
    readonly overrides?: LazyOverrides | undefined

}

export function lazified<I extends {}, D extends {}, P extends {}>(build: (props: I) => LazyBuilder<D, P>) {
    return (component: ComponentType<D & P>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy event={built.event}
                overrides={built.overrides}
                children={(value, state) => createElement(component, { ...callOrGet(built.passthrough, state), ...value })} />
        }
    }
}
