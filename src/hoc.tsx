
import { ComponentType, createElement } from "react"
import { Lazy, LazyOverrides, LazyResult, LazyState } from "."

export type LazyBuilder<D, P extends {}> = { state: LazyState<D>, overrides?: LazyOverrides | undefined, props?: P | undefined }

export function lazified<I extends {}, D, K extends string, P extends {}>(key: K, build: (props: I) => LazyBuilder<D, P>) {
    return (component: ComponentType<P & Record<K, LazyResult<D>>>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy state={built.state} overrides={built.overrides} render={result => createElement(component, { ...built.props!, ...({ [key]: result }) as Record<K, LazyResult<D>> })} />
        }
    }
}
