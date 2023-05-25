import type {Instance} from '../setup'
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

  let indexOfRadiogroup = group.findIndex(e => e === el)
  do {
    // move to the next element
    indexOfRadiogroup += direction
    if (!group[indexOfRadiogroup]) {
      indexOfRadiogroup = direction > 0 ? 0 : group.length - 1
    }
    const element = group[indexOfRadiogroup]

    if (isDisabled(element)) {
      continue
    }

    if (element === el) {
      // If there is only one available radiobutton element, do nothing
    } else {
      focusElement(element)
      instance.dispatchUIEvent(element, 'click')
    }
    break
  } while (true)
}
