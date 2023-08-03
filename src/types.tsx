import { Fragment, ReactNode } from "react"
import { ValueOrFactory } from "value-or-factory"

export type LazyLoading = { status: "loading" }
export type LazyFulfilled<D> = { status: "fulfilled", value: D }
export type LazyRejected = { status: "rejected", reason: unknown, retry?(): void }
export type LazySettled<D> = LazyFulfilled<D> | LazyRejected
export type LazyState<D> = LazySettled<D> | LazyLoading

export type LazyMeta<D> = {
    startedAt: Date
    firstFulfilledAt?: Date | undefined
    lastFulfilledAt?: Date | undefined
    counter: number
    revert(state: LazyState<D>): void
    history: {
        loading: LazyLoading[]
        settled: LazySettled<D>[]
        fulfilled: LazyFulfilled<D>[]
        rejected: LazyRejected[]
    }
}

export type LazyResult<D> = LazyMeta<D> & {
    value: D
    state: LazyState<D>
}

export type LoadingProps<D = unknown> = { title?: string | undefined, meta: LazyMeta<D> }
export type ReloadingProps<D = unknown> = { children: ReactNode, reloading: boolean, title?: string | undefined, meta: LazyMeta<D> }
export type ErrorProps<D = unknown> = { reason: unknown, retry?(): void, meta: LazyMeta<D> }
export type ReloadErrorProps<D = unknown> = { children: ReactNode, reason?: unknown, retry?(): void, meta: LazyMeta<D> }

export type LazyOptions<D = unknown> = {
    onLoading: ValueOrFactory<ReactNode, [LoadingProps<D>]>
    onReloading?: ValueOrFactory<ReactNode, [ReloadingProps<D>]> | undefined
    onError: ValueOrFactory<ReactNode, [ErrorProps<D>]>
    onReloadError?: ValueOrFactory<ReactNode, [ReloadErrorProps<D>]> | undefined
    showLoading: boolean
    showReloading: boolean
    distinguishReloading: boolean
    distinguishReloadError: boolean
    loadingDelay?: number | undefined
    reloadingDelay?: number | undefined
    loadingTitle?: string | undefined
    reloadingTitle?: string | undefined
}

export type LazyOverrides<D = unknown> = Partial<LazyOptions<D>>

export const DEFAULT_LAZY_OPTIONS: LazyOptions = {
    onLoading: () => <Fragment />,
    onReloading: props => props.children,
    onError: props => {
        throw props.reason
    },
    onReloadError: props => {
        if (props.reason !== undefined) {
            throw props.reason
        }
        return props.children
    },
    showLoading: true,
    showReloading: true,
    distinguishReloading: true,
    distinguishReloadError: true,
    loadingDelay: 10,
    reloadingDelay: 10
}
