import { createContext, ReactNode } from "react"
import { ValueOrFactory } from "value-or-factory"

export type LoadingProps = { title?: string }
export type ReloadingProps = { children: ReactNode, title?: string, reloading: boolean }
export type ErrorProps = { error: unknown, retry?(): void }

export type LazyOptions = {
    onLoading: ValueOrFactory<ReactNode, [LoadingProps]>
    onReloading: ValueOrFactory<ReactNode, [ReloadingProps]>
    onError: ValueOrFactory<ReactNode, [ErrorProps]>
    showLoading: boolean
    showReloading: boolean
    distinguishReloading: boolean
    loadingTitle?: string
    reloadingTitle?: string
    loadingDelay: number
    reloadingDelay: number
}

export type LazyOverrides = Partial<LazyOptions>
export type LazyResult<D> = PromiseFulfilledResult<D> | (PromiseRejectedResult & { retry?(): void }) | undefined
export type LazyBuilder<D> = { result: LazyResult<D>, overrides?: LazyOverrides }

export const LazyContext = createContext<LazyOverrides>({})
