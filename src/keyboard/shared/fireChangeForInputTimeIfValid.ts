import {fireEvent} from '@testing-library/dom'
import {isValidInputTimeValue} from '../../utils'

export function fireChangeForInputTimeIfValid(
  el: HTMLInputElement & {type: 'time'},
  prevValue: unknown,
  timeNewEntry: string,
) {
  if (isValidInputTimeValue(el, timeNewEntry) && prevValue !== timeNewEntry) {
    fireEvent.change(el, {target: {value: timeNewEntry}})
  }
}
