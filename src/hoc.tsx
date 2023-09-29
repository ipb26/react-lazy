
import { ComponentType, createElement } from "react"
import { Lazy, LazyOverrides, LazyState } from "."
import { PropsWithState, addProps } from "./internal"

export type LazyPass<K extends string, D> = PropsWithState<K, D, LazyState<D>>

export type LazyBuilder<D> = {

    state: LazyState<D>
    overrides?: LazyOverrides | undefined

}

export function lazified<I extends {}, D, K extends string>(key: K, build: (props: I) => LazyBuilder<D>) {
    return (component: ComponentType<Omit<I, keyof LazyPass<K, D>> & LazyPass<K, D>>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy state={built.state}
                overrides={built.overrides}
                children={value => createElement(component, { ...props, ...addProps(key, value, built.state) })} />
        }
    }
}
