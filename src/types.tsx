import { ReactNode } from "react"
import { ValueOrFactory } from "value-or-factory"

export type LazyEventType<D> = keyof LazyEvents<D>

export type LazyEvents<D> = {

    loading: LazyLoading
    settled: LazySettled<D>
    fulfilled: LazyFulfilled<D>
    rejected: LazyRejected

}

export type LazyLoading = { status: "loading" }
export type LazyFulfilled<D> = { status: "fulfilled", value: D }
export type LazyRejected = { status: "rejected", reason: unknown, retry?(): void }
export type LazySettled<D> = LazyFulfilled<D> | LazyRejected
export type LazyEvent<D> = LazySettled<D> | LazyLoading

export type OnRender<D> = ValueOrFactory<ReactNode, [RenderProps<D>]>
export type OnLoading<D> = ValueOrFactory<ReactNode, [LoadingProps<D>]>
export type OnReloading<D> = ValueOrFactory<ReactNode, [ReloadingProps<D>]> | undefined
export type OnError<D> = ValueOrFactory<ReactNode, [ErrorProps<D>]>
export type OnReloadError<D> = ValueOrFactory<ReactNode, [ReloadErrorProps<D>]> | undefined

export type RenderProps<D = unknown> = {
    state: LazyState<D>
    children: ReactNode
}
export type LoadingProps<D = unknown> = {
    state: LazyState<D>
    title?: string | undefined
}
export type ReloadingProps<D = unknown> = {
    state: LazyState<D>
    children: ReactNode
    reloading: boolean
    title?: string | undefined
}
export type ErrorProps<D = unknown> = {
    state: LazyState<D>
    reason: unknown,
    retry?: undefined | (() => void)
}
export type ReloadErrorProps<D = unknown> = {
    state: LazyState<D>
    children: ReactNode
    reason?: unknown
    retry?: undefined | (() => void)
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
}

export type LazyOverrides<D = any> = Partial<LazyOptions<D>>

export type LazyHistoryEvent<T> = T & { date: Date }

export interface LazyHistory<T> {
    count: number
    first?: LazyHistoryEvent<T> | undefined
    last?: LazyHistoryEvent<T> | undefined
}

export type LazyHistories<D> = {
    [K in keyof LazyEvents<D>]: LazyHistory<LazyEvents<D>[K]>
}

export interface LazyState<D> {
    current: LazyEvent<D>
    history: LazyHistories<D>
}
