import { ReactNode } from "react"

export type LazyLoading = { readonly status: "loading" }
export type LazyFulfilled<D> = { readonly status: "fulfilled", readonly value: D }
export type LazyRejected = { readonly status: "rejected", readonly reason: unknown, readonly retry?: (() => void) | undefined }
export type LazySettled<D> = LazyFulfilled<D> | LazyRejected
export type LazyEvent<D> = LazySettled<D> | LazyLoading

export type OnLoading = (props: LoadingProps) => ReactNode
export type OnReloading = (props: ReloadingProps) => ReactNode
export type OnError = (props: ErrorProps) => ReactNode

export interface LoadingProps {

    /**
     * The message to display.
     */
    readonly message?: string | undefined

}

export interface ReloadingProps {

    /**
     * Whether or not the data is currently reloading.
     */
    readonly reloading: boolean

    /**
     * The message to display.
     */
    readonly message?: string | undefined

    readonly children: ReactNode

}

export interface ErrorProps {

    readonly reason: unknown

    /**
     * The message to display.
     */
    readonly message?: string | undefined

}

export interface LazyOptions {

    readonly onLoading?: OnLoading | undefined
    readonly onReloading?: OnReloading | undefined
    readonly onError?: OnError | undefined

    readonly loadingMessage?: string | undefined
    readonly reloadingMessage?: string | undefined
    readonly errorMessage?: string | undefined

    /**
     * Hides loading and reloading components for this amount of time.
     */
    readonly delay?: number | undefined

}

/**
 * Overrides for lazy options.
 */
export type LazyOverrides = Partial<LazyOptions>
