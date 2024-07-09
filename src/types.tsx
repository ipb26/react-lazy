import { ReactNode } from "react"

export type LazyLoading = { status: "loading" }
export type LazyFulfilled<D> = { status: "fulfilled", value: D }
export type LazyRejected = { status: "rejected", reason: unknown, retry?: (() => void) | undefined }
export type LazySettled<D> = LazyFulfilled<D> | LazyRejected
export type LazyEvent<D> = LazySettled<D> | LazyLoading

export type OnLoading = () => ReactNode
export type OnReloading = (props: ReloadingProps) => ReactNode
export type OnError = (props: ErrorProps) => ReactNode

export interface ReloadingProps {

    readonly reloading: boolean
    readonly children: ReactNode

}

export interface ErrorProps {

    readonly reason: unknown

}

export interface LazyOptions {

    readonly onLoading?: OnLoading | undefined
    readonly onReloading?: OnReloading | undefined
    readonly onError?: OnError | undefined
    readonly delay?: number | undefined

}

export type LazyOverrides = Partial<LazyOptions>
