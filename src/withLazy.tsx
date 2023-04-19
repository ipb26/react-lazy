
import { ComponentType, createElement } from "react"
import { ErrorProps, Lazy, LazyBuilder, LoadingProps } from "./"
import { addKeyToPromiseResult } from "./internal"

export function withLazy<I extends {}, D extends {}, L extends LoadingProps, E extends ErrorProps>(build: (props: I) => LazyBuilder<D, L, E>) {
    return (component: ComponentType<I & D>) => {
        return (props: I) => {
            const built = build(props)
            return <Lazy result={built.result} render={data => createElement(component, { ...props, ...data })} overrides={built.overrides} />
        }
    }
}

export function withLazyAs<I extends {}, D, K extends string, L extends LoadingProps, E extends ErrorProps>(key: K, build: (props: I) => LazyBuilder<D, L, E>) {
    return (component: ComponentType<I & Record<K, D>>) => {
        return (props: I) => {
            const built = build(props)
            const result = addKeyToPromiseResult(key, built.result)
            return <Lazy result={result} render={data => createElement(component, { ...props, ...data })} overrides={built.overrides} />
        }
    }
}
