import {setUIValue} from '../../document'
import {dispatchUIEvent} from '../../event'
import {Config} from '../../setup'
import {isValidInputTimeValue} from '../../utils'

export function fireChangeForInputTimeIfValid(
  config: Config,
  el: HTMLInputElement & {type: 'time'},
  prevValue: unknown,
  timeNewEntry: string,
) {
  if (isValidInputTimeValue(el, timeNewEntry) && prevValue !== timeNewEntry) {
    setUIValue(el, timeNewEntry)
    dispatchUIEvent(config, el, 'change')
  }
}
