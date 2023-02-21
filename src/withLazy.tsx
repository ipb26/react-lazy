
import { ComponentType, createElement } from "react"
import { Lazy, LazyBuilder } from "./"
import { addKeyToPromiseResult } from "./internal"

export function withLazy<I extends {}, D extends {}>(build: (props: I) => LazyBuilder<D>) {
    return (component: ComponentType<I & D>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy result={built.result} render={data => createElement(component, { ...props, ...data })} overrides={built.overrides} />
        }
    }
}

export function withLazyAs<I extends {}, D, K extends string>(key: K, build: (props: I) => LazyBuilder<D>) {
    return (component: ComponentType<I & Record<K, D>>) => {
        return (props: I) => {
            const built = build(props)
            const data = addKeyToPromiseResult(key, built.result)
            return <Lazy result={data} render={data => createElement(component, { ...props, ...data })} overrides={built.overrides} />
        }
    }
}
