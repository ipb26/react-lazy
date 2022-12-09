import { keys } from "ramda"
import { ComponentType, createContext, ReactNode } from "react"
import { defaultLazyOptions, ValueOrFactory } from "./internal"

export type LoadingProps = { title?: string }
export type ReloadingProps = { children: ReactNode, title?: string, reloading: boolean }
export type ErrorProps = { error: unknown, retry?: () => void }

export type LoadingComponentType<T = {}> = ComponentType<T & LoadingProps>
export type ReloadingComponentType<T = {}> = ComponentType<T & ReloadingProps>
export type ErrorComponentType<T = {}> = ComponentType<T & ErrorProps>

export type LazyOptions<T = {}> = {
    onLoading: (props: LoadingProps & T) => JSX.Element
    onReloading: (props: ReloadingProps & T) => JSX.Element
    onError: (props: ErrorProps & T) => JSX.Element
    showLoading: ValueOrFactory<boolean, [T]>
    showReloading: ValueOrFactory<boolean, [T]>
    distinguishReloading: ValueOrFactory<boolean, [T]>
    loadingTitle?: ValueOrFactory<string, [T]>
    reloadingTitle?: ValueOrFactory<string, [T]>
    loadingDelay: ValueOrFactory<number, [T]>
    reloadingDelay: ValueOrFactory<number, [T]>
}

export type LazyOverrides<P = {}> = Partial<LazyOptions<P>>

export type WithLazyOverrides<P> = P & LazyOverrides<P>

export const LazyContext = createContext<LazyOverrides<{}>>({})

export const lazyOptionKeys = keys(defaultLazyOptions)
