import {dispatchUIEvent, setUIValue} from '../../document'
import {isValidInputTimeValue} from '../../utils'

export function fireChangeForInputTimeIfValid(
  el: HTMLInputElement & {type: 'time'},
  prevValue: unknown,
  timeNewEntry: string,
) {
  if (isValidInputTimeValue(el, timeNewEntry) && prevValue !== timeNewEntry) {
    setUIValue(el, timeNewEntry)
    dispatchUIEvent(el, 'change')
  }
}
