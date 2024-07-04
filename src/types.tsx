import { ReactNode } from "react"
import { ValueOrFactory } from "value-or-factory"

export type LazyEventType<D> = keyof LazyEventTypes<D>
export type LazyEventTypes<D> = {

    readonly loading: LazyLoading
    readonly settled: LazySettled<D>
    readonly fulfilled: LazyFulfilled<D>
    readonly rejected: LazyRejected

}

export type LazyLoading = { status: "loading" }
export type LazyFulfilled<D> = { status: "fulfilled", value: D }
export type LazyRejected = { status: "rejected", reason: unknown, retry?(): void }
export type LazySettled<D> = LazyFulfilled<D> | LazyRejected
export type LazyEvent<D> = LazySettled<D> | LazyLoading
export type LazyEvents<D> = LazyEvent<D> | readonly LazyEvent<D>[]

export type OnRender<D> = ValueOrFactory<ReactNode, [RenderProps<D>]>
export type OnLoading<D> = ValueOrFactory<ReactNode, [LoadingProps<D>]>
export type OnReloading<D> = ValueOrFactory<ReactNode, [ReloadingProps<D>]> | undefined
export type OnError<D> = ValueOrFactory<ReactNode, [ErrorProps<D>]>
export type OnReloadError<D> = ValueOrFactory<ReactNode, [ReloadErrorProps<D>]> | undefined

export type RenderProps<D = unknown> = {
    readonly state: LazyState<D>
    readonly children: ReactNode
}
export type LoadingProps<D = unknown> = {
    readonly state: LazyState<D>
    readonly title?: string | undefined
}
export type ReloadingProps<D = unknown> = {
    readonly state: LazyState<D>
    readonly children: ReactNode
    readonly reloading: boolean
    readonly title?: string | undefined
}
export type ErrorProps<D = unknown> = {
    readonly state: LazyState<D>
    readonly reason: unknown,
    readonly retry?: undefined | (() => void)
}
export type ReloadErrorProps<D = unknown> = {
    readonly state: LazyState<D>
    readonly children: ReactNode
    readonly reason?: unknown
    readonly retry?: undefined | (() => void)
}

export type LazyOptions<D = any> = {
    readonly onRender?: OnRender<D>
    readonly onLoading?: OnLoading<D>
    readonly onReloading?: OnReloading<D>
    readonly onError?: OnError<D>
    readonly onReloadError?: OnReloadError<D>
    readonly showLoading: boolean
    readonly showReloading: boolean
    readonly distinguishReloading: boolean
    readonly distinguishReloadError: boolean
    readonly loadingDelay?: number | undefined
    readonly reloadingDelay?: number | undefined
    readonly loadingTitle?: string | undefined
    readonly reloadingTitle?: string | undefined

    /**
     * A callback that is called when the event changes.
     * @param event The event.
     */
    readonly onChange?: (event: LazyEvent<D>) => void

}

export type LazyOverrides<D = any> = Partial<LazyOptions<D>>

export type LazyHistoryEvent<T> = T & { readonly date: Date }

export interface LazyHistory<T> {

    readonly count: number
    readonly first?: LazyHistoryEvent<T> | undefined
    readonly last?: LazyHistoryEvent<T> | undefined

}

export type LazyHistories<D> = {

    readonly [K in keyof LazyEventTypes<D>]: LazyHistory<LazyEventTypes<D>[K]>

}

export interface LazyState<D> {

    readonly current: LazyEvent<D>
    readonly history: LazyHistories<D>

}
