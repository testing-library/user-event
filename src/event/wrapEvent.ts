import {getConfig} from '@testing-library/dom'

export function wrapEvent<R>(cb: () => R, _element: Element) {
  return getConfig().eventWrapper(cb) as unknown as R
}
