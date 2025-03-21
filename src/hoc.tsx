
import { ComponentType, createElement } from "react"
import { Lazy, LazyEvent, LazyOverrides } from "."

export type LazyBuilder<D, P> = {

    readonly event: LazyEvent<D>
    readonly passthrough: P
    readonly overrides?: LazyOverrides | undefined

}

export function lazified<I extends {}, D extends {}, P extends {}>(build: (props: I) => LazyBuilder<D, P>) {
    return (component: ComponentType<D & P>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy event={built.event}
                overrides={built.overrides}
                children={value => createElement(component, { ...built.passthrough!, ...value })} />
        }
    }
}
