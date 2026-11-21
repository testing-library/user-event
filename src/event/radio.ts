import {type Instance} from '../setup'
import {isDisabled} from '../utils'
import {focusElement} from './focus'

export function walkRadio(
  instance: Instance,
  el: HTMLInputElement & {type: 'radio'},
  direction: -1 | 1,
) {
  // Compare `name` directly instead of building a selector:
  // `window.CSS.escape` is not available in every DOM implementation (e.g. jsdom).
  const group = Array.from(
    el.ownerDocument.querySelectorAll<HTMLInputElement & {type: 'radio'}>(
      'input[type="radio"]',
    ),
  ).filter(e => e.name === el.name)
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
