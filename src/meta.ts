import { LazyFulfilled, LazyLoading, LazyRejected, LazySettled, LazyState } from "./types"

export type LazyHistoryItem<T> = T & {
    date: Date
}
export type LazyHistory<T> = {
    count: number
    stack: LazyHistoryItem<T>[]
}

export type LazyMeta<D> = {
    state: LazyState<D>
    revert: (state: LazyState<D>) => void
    history: {
        loading: LazyHistory<LazyLoading>
        settled: LazyHistory<LazySettled<D>>
        fulfilled: LazyHistory<LazyFulfilled<D>>
        rejected: LazyHistory<LazyRejected>
    }
}

function addToHistory<T>(history: LazyHistory<T> | undefined, state: T | undefined, stackLimit = 0) {
    if (state === undefined) {
        return {
            count: 0,
            stack: new Array<LazyHistoryItem<T>>(),
        }
    }
    const add = [...history?.stack ?? [], ...state !== undefined ? [{ date: new Date(), ...state }] : []]
    const stack = [...add.slice(0, 1), ...add.slice(1, 1 + Math.max(stackLimit ?? add.length - 2, 0)), ...add.slice(-1)]
    return {
        count: history?.count ?? 0 + 1,
        stack,
    }
}

export function addToMeta<D>(state: LazyState<D>, revert: (state: LazyState<D>) => void, stackLimit?: number, meta?: LazyMeta<D>): LazyMeta<D> {
    return {
        state,
        revert,
        history: {
            loading: addToHistory(meta?.history.loading, state.status === "loading" ? state : undefined, stackLimit),
            settled: addToHistory(meta?.history.settled, state.status !== "loading" ? state : undefined, stackLimit),
            fulfilled: addToHistory(meta?.history.fulfilled, state.status === "fulfilled" ? state : undefined, stackLimit),
            rejected: addToHistory(meta?.history.rejected, state.status === "rejected" ? state : undefined, stackLimit),
        }
    }
}
