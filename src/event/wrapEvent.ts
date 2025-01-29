import {getConfig} from '@testing-library/dom'

export function wrapEvent<R>(
  cb: () => R,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _element: Element,
) {
  return getConfig().eventWrapper(cb) as unknown as R
}
