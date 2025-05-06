import { useRef } from "react"

export function useIsFirstMount() {
    const isFirst = useRef(true)
    if (isFirst.current) {
        isFirst.current = false
        return true
    }
    return isFirst.current
}

export function usePrevious<T>(value: { readonly current: T } | undefined) {
    const previous = useRef(value?.current)
    const first = useIsFirstMount()
    if (!first) {
        if (value !== undefined) {
            previous.current = value.current
        }
    }
    return previous.current
}
