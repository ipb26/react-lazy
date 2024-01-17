import { createContext, useEffect, useState } from "react"
import { addToHistory, isType, useIsFirstMount } from "./internal"
import { LazyEvents, LazyOverrides, LazyState } from "./types"

export const LazyContext = createContext<LazyOverrides>({})

export function flattenEvents<D>(events: LazyEvents<D>) {
    return [events].flat()
}

/*
export function combineEvents<D>(events: LazyEvents<D>, defaultEvent = { status: "loading" as const }) {
    const current = flattenEvents(events).at(-1) ?? defaultEvent
    const stack = flattenEvents(events).length === 0 ? [defaultEvent] : [events].flat()
    return {
        current,
        history: {
            loading: addToHistory({ count: 0 }, stack.filter(isType("loading")).at(0)),
            settled: addToHistory({ count: 0 }, stack.filter(isType("settled")).at(0)),
            fulfilled: addToHistory({ count: 0 }, stack.filter(isType("fulfilled")).at(0)),
            rejected: addToHistory({ count: 0 }, stack.filter(isType("rejected")).at(0))
        }
    }
}
*/

export function useLazyState<D>(events: LazyEvents<D>, defaultEvent = { status: "loading" as const }) {
    const current = flattenEvents(events).at(-1) ?? defaultEvent
    const stack = flattenEvents(events).length === 0 ? [defaultEvent] : [events].flat()
    const [state, setState] = useState<LazyState<D>>(() => {
        return {
            current,
            history: {
                loading: addToHistory({ count: 0 }, stack.filter(isType("loading")).at(0)),
                settled: addToHistory({ count: 0 }, stack.filter(isType("settled")).at(0)),
                fulfilled: addToHistory({ count: 0 }, stack.filter(isType("fulfilled")).at(0)),
                rejected: addToHistory({ count: 0 }, stack.filter(isType("rejected")).at(0))
            }
        }
    })
    const first = useIsFirstMount()
    useEffect(() => {
        if (first) {
            return
        }
        setState(state => {
            return {
                current,
                history: {
                    loading: addToHistory(state.history.loading, stack.filter(isType("loading")).at(0)),
                    settled: addToHistory(state.history.settled, stack.filter(isType("settled")).at(0)),
                    fulfilled: addToHistory(state.history.fulfilled, stack.filter(isType("fulfilled")).at(0)),
                    rejected: addToHistory(state.history.rejected, stack.filter(isType("rejected")).at(0))
                }
            }
        })
    }, [
        events
    ])
    return state
}
