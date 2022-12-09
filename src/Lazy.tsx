
import { ComponentType, Fragment, useContext, useEffect, useRef, useState } from "react"
import { LazyContext, LazyOverrides } from "."
import { defaultLazyOptions, processLazyOptions, useDelayed } from "./internal"

export type LazyProps<D, P> = LazyOverrides<P> & {
	pass: P
	component: ComponentType<P & D>
	result?: PromiseSettledResult<D>
}

export function Lazy<D extends {}, P extends {}>(props: LazyProps<D, P>) {
	const defaults = useContext(LazyContext)
	const isFirstMount = useRef(true)
	const [prev, setPrev] = useState(props.result)
	useEffect(() => {
		if (isFirstMount.current) {
			isFirstMount.current = false
		}
		else {
			if (props.result !== undefined) {
				setPrev(props.result)
			}
		}
	}, [props.result === undefined])
	const options = processLazyOptions({ ...defaultLazyOptions, ...defaults, ...props }, props.pass)
	const data = props.result ?? prev
	const isLoading = data === undefined || (props.result === undefined && !options.distinguishReloading)
	const isReloading = props.result === undefined
	const loadingReady = useDelayed(isLoading ? options.loadingDelay : 0)
	const reloadingReady = useDelayed(isReloading ? options.reloadingDelay : 0)
	if (isLoading) {
		if (!options.showLoading || !loadingReady) {
			return <Fragment />
		}
		const OnLoading = options.onLoading
		return <OnLoading {...props.pass} title={options.loadingTitle} />
	}
	else {
		const OnReloading = options.onReloading
		return (
			<OnReloading {...props.pass} reloading={options.showReloading && isReloading && reloadingReady} title={options.reloadingTitle}>
				{
					(() => {
						if (data.status === "rejected") {
							const OnError = options.onError
							return <OnError {...props.pass} error={data.reason} />
						}
						else {
							const Component = props.component
							return <Component {...props.pass} {...data.value} />
						}
					})()
				}
			</OnReloading>
		)
	}
}
