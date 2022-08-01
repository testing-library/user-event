import {dispatchUIEvent} from '../../event'
import {Config} from '../../setup'
import {focus} from '../focus/focus'
import {getWindow} from '../misc/getWindow'
import {isDisabled} from '../misc/isDisabled'

export function walkRadio(
  config: Config,
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

    focus(group[i])
    dispatchUIEvent(config, group[i], 'click')
  }
}
