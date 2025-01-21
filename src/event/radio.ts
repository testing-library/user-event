import {type Instance} from '../setup'
import {getWindow, isDisabled} from '../utils'
import {focusElement} from './focus'

export function walkRadio(
  instance: Instance,
  el: HTMLInputElement & {type: 'radio'},
  direction: -1 | 1,
) {
  const window = getWindow(el)
  const group = Array.from(
    el.ownerDocument.querySelectorAll<HTMLInputElement & {type: 'radio'}>(
      el.name
        ? `input[type="radio"][name="${window.CSS.escape(el.name)}"]`
        : `input[type="radio"][name=""], input[type="radio"]:not([name])`,
    ),
  )
  for (let i = group.findIndex(e => e === el) + direction; ; i += direction) {
    if (!group[i]) {
      i = direction > 0 ? 0 : group.length - 1
    }
    if (group[i] === el) {
      return
    }
    if (isDisabled(group[i])) {
      continue
    }

    focusElement(group[i])
    instance.dispatchUIEvent(group[i], 'click')
    return
  }
}
