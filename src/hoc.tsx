
import { ComponentType, createElement } from "react"
import { Lazy, LazyEvent, LazyOverrides } from "."
import { KeyProps, addProps } from "./internal"

export type LazyPass<K extends string, D> = KeyProps<K, D>

export type LazyBuilder<D> = {

    readonly event: LazyEvent<D>
    readonly overrides?: LazyOverrides | undefined

}

export function lazified<I extends {}, D, K extends string>(key: K, build: (props: I) => LazyBuilder<D>) {
    return (component: ComponentType<I & LazyPass<K, D>>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy event={built.event}
                overrides={[built.overrides]}
                children={value => createElement(component, { ...props, ...addProps(key, value) })} />
        }
    }
}
