import {prepareInterceptor} from './interceptor'

const UISelection = Symbol('Displayed selection in UI')

interface Value extends Number {
  [UISelection]?: typeof UISelection
}

declare global {
  interface Element {
    [UISelection]?: {start: number; end: number}
  }
}

function setSelectionInterceptor(
  this: HTMLInputElement | HTMLTextAreaElement,
  start: number | Value | null,
  end: number | null,
  direction: 'forward' | 'backward' | 'none' = 'none',
) {
  const isUI = start && typeof start === 'object' && start[UISelection]

  this[UISelection] = isUI
    ? {start: start.valueOf(), end: Number(end)}
    : undefined

  return {
    realArgs: [Number(start), end, direction] as [
      number,
      number,
      typeof direction,
    ],
  }
}

export function prepareSelectionInterceptor(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  prepareInterceptor(element, 'setSelectionRange', setSelectionInterceptor)
}

export function setUISelection(
  element: HTMLInputElement | HTMLTextAreaElement,
  start: number,
  end: number,
) {
  element[UISelection] = {start, end}

  if (element.selectionStart === start && element.selectionEnd === end) {
    return
  }

  // eslint-disable-next-line no-new-wrappers
  const startObj = new Number(start)
  ;(startObj as Value)[UISelection] = UISelection

  try {
    element.setSelectionRange(startObj as number, end)
  } catch {
    // DOMException for invalid state is expected when calling this
    // on an element without support for setSelectionRange
  }
}

export function getUISelection(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  const ui = element[UISelection]
  return ui === undefined
    ? {
        selectionStart: element.selectionStart,
        selectionEnd: element.selectionEnd,
      }
    : {
        selectionStart: ui.start,
        selectionEnd: ui.end,
      }
}

export function clearUISelection(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  element[UISelection] = undefined
}
