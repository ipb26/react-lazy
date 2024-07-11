
import { ComponentType, createElement } from "react"
import { Lazy, LazyEvent, LazyOverrides } from "."
import { KeyProps, addProps } from "./internal"

export type LazyPass<K extends string, D> = KeyProps<K, D>

export type LazyBuilder<D, P> = {

    readonly event: LazyEvent<D>
    readonly passthrough?: P | undefined // TODO make this conditionally optional
    readonly overrides?: LazyOverrides | undefined

}

//TODO rm
export function lazified<I extends {}, D, K extends string>(key: K, build: (props: I) => LazyBuilder<D, never>) {
    return (component: ComponentType<I & LazyPass<K, D>>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy event={built.event}
                overrides={built.overrides}
                children={value => createElement(component, { ...props, ...addProps(key, value) })} />
        }
    }
}

export function lazified2<I extends {}, D extends {}, P extends {}>(build: (props: I) => LazyBuilder<D, P>) {
    return (component: ComponentType<D & P>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy event={built.event}
                overrides={built.overrides}
                children={value => createElement(component, { ...built.passthrough!, ...value })} />
        }
    }
}
