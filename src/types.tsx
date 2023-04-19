import { createContext, ReactNode } from "react"
import { ValueOrFactory } from "value-or-factory"

export type LoadingProps = { title?: string, counter?: number, cancel?(): void }
export type ReloadingProps<L> = { children: ReactNode, reloading?: L }
export type ErrorProps = { reason: unknown, counter?: number, retry?(): void }

export type LazyOptions<L extends LoadingProps = LoadingProps, E extends ErrorProps = ErrorProps> = {
    onLoading: ValueOrFactory<ReactNode, [L]>
    onReloading: ValueOrFactory<ReactNode, [ReloadingProps<L>]>
    onError: ValueOrFactory<ReactNode, [E]>
    showLoading: boolean
    showReloading: boolean
    distinguishReloading: boolean
    loadingTitle?: string
    reloadingTitle?: string
    loadingDelay: number
    reloadingDelay: number
}

export type LazyOverrides<L extends LoadingProps = LoadingProps, E extends ErrorProps = ErrorProps> = Partial<LazyOptions<L, E>>

export type LazySettled<D, E extends ErrorProps> = LazyFulfilled<D> | LazyRejected<E>
export type LazyFulfilled<D> = { status: "fulfilled", value: D }
export type LazyRejected<E extends ErrorProps> = { status: "rejected", props: E & ErrorProps }
export type LazyLoading<L extends LoadingProps> = { status: "loading" } & LoadingProps & L
export type LazyResult<D, L extends LoadingProps = LoadingProps, E extends ErrorProps = ErrorProps> = LazySettled<D, E> | LazyLoading<L>

export type LazyBuilder<D, L extends LoadingProps, E extends ErrorProps> = { result: LazyResult<D, L, E>, overrides?: LazyOverrides<L, E> }

export const LazyContext = createContext<LazyOverrides>({})
