import { createContext } from "react"
import { LazyEvent, LazyOverrides } from "./types"

export const LazyContext = createContext<LazyOverrides>({})

export function flattenEvents<D>(events: LazyEvent<D>) {
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
/*
export function useLazyState<D>(current: LazyEvent<D>) {
    //const current = event ?? 
    //const stack = flattenEvents(events).length === 0 ? [defaultEvent] : [events].flat()
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
        if (first) {
            return
        }
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
    }, [
        current
    ])
    return state
}
*/
