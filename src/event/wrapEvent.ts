import dtl from '../_interop/dtl'

const {getConfig} = dtl

export function wrapEvent<R>(cb: () => R, _element: Element) {
  return getConfig().eventWrapper(cb) as unknown as R
}
