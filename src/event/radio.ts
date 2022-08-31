import {type Instance} from '../setup'
import {getWindow, isDisabled} from '../utils'
import {focusElement} from './focus'

function setNewActiveRadio(instance: Instance, el: HTMLInputElement & {type: 'radio'}) {
  focusElement(el)
  instance.dispatchUIEvent(el, 'click')
}

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
  const nextRadioIndex = group.indexOf(el) + direction;
  // Multiple radio buttons
  if (direction === 1) {
    // Moving forwards in group
    if (nextRadioIndex < group.length) {
      // Don't need to wrap around
      return setNewActiveRadio(instance, group[nextRadioIndex])
    }
    // Special case: do need to wrap around
    return setNewActiveRadio(instance, group[0])
  }
  // Moving backwards in group
  if (nextRadioIndex >= 0) {
    // Don't need to wrap around
    return setNewActiveRadio(instance, group[nextRadioIndex])
  }
  // Special case: do need to wrap around
  setNewActiveRadio(instance, group[group.length - 1])
}
