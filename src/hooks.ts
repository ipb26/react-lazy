import { createContext, useEffect, useState } from "react"
import { addToHistory, isType, useIsFirstMount } from "./internal"
import { LazyEvent, LazyOverrides, LazyState } from "./types"

export const LazyContext = createContext<LazyOverrides>({})

export function useLazyState<D>(current: LazyEvent<D>) {
    const [state, setState] = useState<LazyState<D>>(() => {
        return {
            current,
            history: {
                loading: addToHistory({ count: 0 }, [current].filter(isType("loading")).at(0)),
                settled: addToHistory({ count: 0 }, [current].filter(isType("settled")).at(0)),
                fulfilled: addToHistory({ count: 0 }, [current].filter(isType("fulfilled")).at(0)),
                rejected: addToHistory({ count: 0 }, [current].filter(isType("rejected")).at(0))
            }
        }
    })
    const first = useIsFirstMount()
    useEffect(() => {
        if (!first) {
            setState(state => {
                return {
                    current,
                    history: {
                        loading: addToHistory(state.history.loading, [current].filter(isType("loading")).at(0)),
                        settled: addToHistory(state.history.settled, [current].filter(isType("settled")).at(0)),
                        fulfilled: addToHistory(state.history.fulfilled, [current].filter(isType("fulfilled")).at(0)),
                        rejected: addToHistory(state.history.rejected, [current].filter(isType("rejected")).at(0))
                    }
                }
            })
        }
    }, [
        current
    ])
    return state
}
