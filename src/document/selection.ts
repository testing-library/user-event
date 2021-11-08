import {getUIValue} from '.'
import {prepareInterceptor} from './interceptor'

const UISelection = Symbol('Displayed selection in UI')

interface Value extends Number {
  [UISelection]?: typeof UISelection
}

export interface UISelectionRange {
  startOffset: number
  endOffset: number
}

export interface UISelection {
  anchorOffset: number
  focusOffset: number
  ranges: Array<UISelectionRange>
}

declare global {
  interface Element {
    [UISelection]?: UISelection
  }
}

export function prepareSelectionInterceptor(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  prepareInterceptor(
    element,
    'setSelectionRange',
    function interceptorImpl(
      this: HTMLInputElement | HTMLTextAreaElement,
      start: number | Value | null,
      end: number | null,
      direction: 'forward' | 'backward' | 'none' = 'none',
    ) {
      const isUI = start && typeof start === 'object' && start[UISelection]

      if (!isUI) {
        this[UISelection] = undefined
      }

      return {
        realArgs: [Number(start), end, direction] as [
          number,
          number,
          typeof direction,
        ],
      }
    },
  )

  prepareInterceptor(
    element,
    'selectionStart',
    function interceptorImpl(this, v) {
      this[UISelection] = undefined

      return {realArgs: v}
    },
  )
  prepareInterceptor(
    element,
    'selectionEnd',
    function interceptorImpl(this, v) {
      this[UISelection] = undefined

      return {realArgs: v}
    },
  )
}

export function setUISelection(
  element: HTMLInputElement | HTMLTextAreaElement,
  {
    focusOffset: focusOffsetParam,
    anchorOffset: anchorOffsetParam = focusOffsetParam,
  }: {
    anchorOffset?: number
    focusOffset: number
  },
  mode: 'replace' | 'add' | 'modify' = 'replace',
) {
  // TODO: remove range overlap
  // New ranges "eat up" old ranges.
  // If a new range selects a part of an older range and then unselects that part,
  // it ends up unselected.

  // TODO: remove empty ranges (except last one)

  const valueLength = getUIValue(element).length
  const sanitizeOffset = (o: number) => Math.max(0, Math.min(valueLength, o))

  const anchorOffset =
    mode === 'replace' || element[UISelection] === undefined
      ? sanitizeOffset(anchorOffsetParam)
      : (element[UISelection] as UISelection).anchorOffset
  const focusOffset = sanitizeOffset(focusOffsetParam)

  const previousRanges = element[UISelection]?.ranges ?? []
  const ranges =
    mode === 'replace'
      ? []
      : mode === 'add'
      ? previousRanges
      : previousRanges.slice(0, -1)

  const startOffset = Math.min(anchorOffset, focusOffset)
  const endOffset = Math.max(anchorOffset, focusOffset)
  ranges.push({startOffset, endOffset})

  element[UISelection] = {
    anchorOffset,
    focusOffset,
    ranges,
  }

  if (
    element.selectionStart === startOffset &&
    element.selectionEnd === endOffset
  ) {
    return
  }

  // eslint-disable-next-line no-new-wrappers
  const startObj = new Number(startOffset)
  ;(startObj as Value)[UISelection] = UISelection

  try {
    element.setSelectionRange(startObj as number, endOffset)
  } catch {
    // DOMException for invalid state is expected when calling this
    // on an element without support for setSelectionRange
  }
}

export function getUISelection(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  const sel = element[UISelection] ?? {
    anchorOffset: element.selectionStart ?? 0,
    focusOffset: element.selectionEnd ?? 0,
    ranges: [
      {
        startOffset: element.selectionStart ?? 0,
        endOffset: element.selectionEnd ?? 0,
      },
    ],
  }
  return {
    ...sel,
    startOffset: Math.min(sel.anchorOffset, sel.focusOffset),
    endOffset: Math.max(sel.anchorOffset, sel.focusOffset),
  }
}

export function clearUISelection(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  element[UISelection] = undefined
}
