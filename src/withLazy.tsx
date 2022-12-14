
import { omit, pick } from "ramda"
import { ComponentType } from "react"
import { Lazy, lazyOptionKeys, LazyOverrides } from "./"

export type LazyBuilder<I, D, P> = { result?: PromiseSettledResult<D>, pass: P } & LazyOverrides<I & P>

export function withLazy<I extends {}, D extends {}, P extends {}>(build: (props: I) => LazyBuilder<I, D, P>, overrides: LazyOverrides<I & P>) {
    return (component: ComponentType<D & Omit<I, keyof LazyOverrides<I & P>>>) => {//TODO rm omit?
        return (props: I & LazyOverrides<I & P>) => {
            const built = build(props)
            const options = pick(lazyOptionKeys, { ...overrides, ...props, ...built })
            const pass = omit(lazyOptionKeys, props)
            return <Lazy result={built.result} pass={pass} component={component} {...options} />
        }
    }
}
