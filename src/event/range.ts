import {type Instance} from '../setup'
import {getWindow, isDisabled} from '../utils'

export function stepRange(
  instance: Instance,
  input: HTMLInputElement,
  key: string,
) {
  if (input.type !== 'range' || isDisabled(input)) {
    return
  }

  const window = getWindow(input)
  const direction = getInheritedStyle(input, 'direction')
  const vertical = getInheritedStyle(input, 'writing-mode').startsWith('vertical')
  const increaseX = !vertical && direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const increaseY = vertical && direction !== 'rtl' ? 'ArrowDown' : 'ArrowUp'
  const increase = key === increaseX || key === increaseY
  const previous = input.valueAsNumber
  const step = increase ? 'stepUp' : 'stepDown'

  if (input.step.toLowerCase() === 'any') {
    stepAny(input, step)
  } else {
    input[step]()
  }

  if (input.valueAsNumber !== previous) {
    instance.dispatchEvent(
      input,
      new window.Event('input', {bubbles: true, composed: true}),
    )
    instance.dispatchUIEvent(input, 'change')
  }
}

function getInheritedStyle(
  input: HTMLInputElement,
  property: 'direction' | 'writing-mode',
) {
  const window = getWindow(input)
  // Some DOM implementations omit inherited values from the computed style.
  for (let el: HTMLElement | null = input; el; el = el.parentElement) {
    const value = window.getComputedStyle(el).getPropertyValue(property)
    if (value === 'inherit' || value === 'unset') {
      continue
    }
    if (value) {
      return value
    }
    if (property === 'direction' && el.dir) {
      return el.dir
    }
  }
  return ''
}

function stepAny(input: HTMLInputElement, step: 'stepUp' | 'stepDown') {
  // stepUp/stepDown reject step="any". Chromium and WebKit use one percent
  // of the range, starting at the current value.
  const number = input.ownerDocument.createElement('input')
  number.type = 'number'
  number.value = input.min
  const min = number.value === '' ? 0 : number.valueAsNumber
  number.value = input.max
  const max = number.value === '' ? 100 : number.valueAsNumber
  if (max <= min) {
    return
  }
  const span = max - min
  const increment = Number.isFinite(span) ? span / 100 : max / 100 - min / 100
  if (increment > 0) {
    number.step = String(increment)
    number.defaultValue = input.value
    number.value = input.value
    number[step]()
    input.valueAsNumber = Math.min(max, Math.max(min, number.valueAsNumber))
  }
}
