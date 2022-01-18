import {getConfig} from '@testing-library/dom'

export function fireEvent(target: Element, event: Event): boolean {
  return getConfig().eventWrapper(() => {
    return target.dispatchEvent(event)
  }) as unknown as boolean
}
