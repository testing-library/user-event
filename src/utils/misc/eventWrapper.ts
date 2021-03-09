import {getConfig} from '@testing-library/dom'

export function eventWrapper<T>(cb: () => T): T | undefined {
  let result
  getConfig().eventWrapper(() => {
    result = cb()
  })
  return result
}
