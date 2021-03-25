import {getValue, hasUnreliableEmptyValue} from '../../utils'
import {keyboardState} from '../types'

export function carryValue(
  element: Element,
  state: keyboardState,
  newValue: string,
) {
  const value = getValue(element)
  state.carryValue =
    value !== newValue && value === '' && hasUnreliableEmptyValue(element)
      ? newValue
      : undefined
}
