import {type Instance} from '../setup'
import {getWindow, isDisabled} from '../utils'

export function setOptionSelected(
  instance: Instance,
  select: HTMLSelectElement,
  option: HTMLOptionElement,
  selected: boolean,
) {
  option.selected = selected
  instance.dispatchUIEvent(select, 'input')
  instance.dispatchUIEvent(select, 'change')
}

export function walkSelect(
  instance: Instance,
  select: HTMLSelectElement,
  direction: -1 | 1,
) {
  const {options, selectedIndex} = select

  for (
    let index = selectedIndex + direction;
    index >= 0 && index < options.length;
    index += direction
  ) {
    const option = options[index]
    if (!isDisabled(option) && isOptionDisplayed(option, select)) {
      setOptionSelected(instance, select, option, true)
      return
    }
  }
}

function isOptionDisplayed(
  option: HTMLOptionElement,
  select: HTMLSelectElement,
) {
  const window = getWindow(select)
  // Chromium skips display: none options but can select visibility: hidden ones.
  for (
    let el: Element | null = option;
    el && el !== select;
    el = el.parentElement
  ) {
    if (window.getComputedStyle(el).display === 'none') {
      return false
    }
  }
  return true
}
