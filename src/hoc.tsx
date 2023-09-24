
import { ComponentType, createElement } from "react"
import { Lazy, LazyOverrides, LazyState } from "."
import { LazyMeta } from "./meta"

export type LazyPass<K extends string, D> = { [X in K]: D } & { [P in `${K}Meta`]: LazyMeta<D> }
export type LazyBuilder<D> = { state: LazyState<D>, overrides?: LazyOverrides | undefined }

export function lazified<I extends {}, D, K extends string>(key: K, build: (props: I) => LazyBuilder<D>) {
    return (component: ComponentType<Omit<I, keyof LazyPass<K, D>> & LazyPass<K, D>>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy state={built.state}
                overrides={built.overrides}
                children={(value, meta) => createElement(component, { ...props, ...({ [key]: value, [key + "Meta"]: meta }) as LazyPass<K, D> })} />
        }
    }
}
