
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

export function withLazyAs<I extends {}, D, P extends {}, K extends string>(key: K, build: (props: I) => LazyBuilder<I, D, P>, overrides: LazyOverrides<I & P>) {
    return withLazy<I, Record<K, D>, P>(props => {
        const built = build(props)
        return {
            ...built,
            result: (() => {
                if (built.result?.status === "fulfilled") {
                    return {
                        status: built.result.status,
                        value: { [key]: built.result.value } as Record<K, D>
                    }
                }
                else {
                    return built.result
                }
            })(),
        }
    }, overrides)
}
