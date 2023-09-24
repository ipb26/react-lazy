import { ReactNode } from "react"
import { ValueOrFactory } from "value-or-factory"
import { LazyMeta } from "./meta"

export type LazyLoading = { status: "loading" }
export type LazyFulfilled<D> = { status: "fulfilled", value: D }
export type LazyRejected = { status: "rejected", reason: unknown, retry?(): void }
export type LazySettled<D> = LazyFulfilled<D> | LazyRejected
export type LazyState<D> = LazySettled<D> | LazyLoading


export type OnRender<D> = ValueOrFactory<ReactNode, [RenderProps<D>]>
export type OnLoading<D> = ValueOrFactory<ReactNode, [LoadingProps<D>]>
export type OnReloading<D> = ValueOrFactory<ReactNode, [ReloadingProps<D>]> | undefined
export type OnError<D> = ValueOrFactory<ReactNode, [ErrorProps<D>]>
export type OnReloadError<D> = ValueOrFactory<ReactNode, [ReloadErrorProps<D>]> | undefined

export type RenderProps<D = unknown> = {
    meta: LazyMeta<D>
}
export type LoadingProps<D = unknown> = {
    title?: string | undefined,
    meta: LazyMeta<D>
}
export type ReloadingProps<D = unknown> = {
    children: ReactNode,
    reloading: boolean,
    title?: string | undefined,
    meta: LazyMeta<D>
}
export type ErrorProps<D = unknown> = {
    reason: unknown,
    retry?: undefined | (() => void),
    meta: LazyMeta<D>
}
export type ReloadErrorProps<D = unknown> = {
    children: ReactNode,
    reason?: unknown,
    retry?: undefined | (() => void),
    meta: LazyMeta<D>
}

export type LazyOptions<D = any> = {
    onRender?: OnRender<D>
    onLoading?: OnLoading<D>
    onReloading?: OnReloading<D>
    onError?: OnError<D>
    onReloadError?: OnReloadError<D>
    showLoading: boolean
    showReloading: boolean
    distinguishReloading: boolean
    distinguishReloadError: boolean
    loadingDelay?: number | undefined
    reloadingDelay?: number | undefined
    loadingTitle?: string | undefined
    reloadingTitle?: string | undefined
    stackLimit?: number
}

export type LazyOverrides<D = any> = Partial<LazyOptions<D>>

export const DEFAULT_LAZY_OPTIONS: LazyOptions = {
    showLoading: true,
    showReloading: true,
    distinguishReloading: true,
    distinguishReloadError: false,
    loadingDelay: 10,
    reloadingDelay: 10
}
