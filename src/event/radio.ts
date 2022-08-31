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
  ).filter(elt => !isDisabled(elt))
  // 1 or 0 radio buttons found
  if (group.length <= 1) {
    return;
  }
  // Multiple buttons found
  const nextRadioElement = group[(group.indexOf(el) + direction + group.length) % group.length];
  focusElement(nextRadioElement)
  instance.dispatchUIEvent(nextRadioElement, 'click')
}
