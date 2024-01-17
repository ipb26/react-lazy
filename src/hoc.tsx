
import { ComponentType, createElement } from "react"
import { Lazy, LazyState as LazyEvent, LazyEvents, LazyOverrides } from "."
import { PropsWithState, addProps } from "./internal"

export type LazyPass<K extends string, D> = PropsWithState<K, D, LazyEvent<D>>

export type LazyBuilder<D> = {

    readonly events: LazyEvents<D>
    readonly overrides?: LazyOverrides | undefined

}

export function lazified<I extends {}, D, K extends string>(key: K, build: (props: I) => LazyBuilder<D>) {
    return (component: ComponentType<Omit<I, keyof LazyPass<K, D>> & LazyPass<K, D>>) => {
        return (props: I & { overrides?: LazyOverrides | undefined }) => {
            const built = build(props)
            return <Lazy events={built.events}
                overrides={[props.overrides, built.overrides]}
                children={(value, state) => createElement(component, { ...props, ...addProps(key, value, state) })} />
        }
    }
}
