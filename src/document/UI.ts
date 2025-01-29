const UIValue = Symbol('Displayed value in UI')
const UISelection = Symbol('Displayed selection in UI')
const InitialValue = Symbol('Initial value to compare on blur')

declare global {
  interface Element {
    [UIValue]?: string
    [InitialValue]?: string
    [UISelection]?: UISelection
  }
}

interface UISelection {
  anchorOffset: number
  focusOffset: number
}

export type UIValueString = string & {[UIValue]: true}
export type UISelectionStart = number & {[UISelection]: true}

export function isUIValue(
  value: string | UIValueString,
): value is UIValueString {
  return typeof value === 'object' && UIValue in value
}

export function isUISelectionStart(
  start: number | UISelectionStart | null,
): start is UISelectionStart {
  return !!start && typeof start === 'object' && UISelection in start
}

export function setUIValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  if (element[InitialValue] === undefined) {
    element[InitialValue] = element.value
  }

  element[UIValue] = value

  element.value = Object.assign(new String(value), {
    [UIValue]: true,
  }) as unknown as string
}

export function getUIValue(element: HTMLInputElement | HTMLTextAreaElement) {
  return element[UIValue] === undefined
    ? element.value
    : String(element[UIValue])
}

/** Flag the IDL value as clean. This does not change the value. */
export function setUIValueClean(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  element[UIValue] = undefined
}

export function clearInitialValue(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  element[InitialValue] = undefined
}

export function getInitialValue(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  return element[InitialValue]
}

export function setUISelectionRaw(
  element: HTMLInputElement | HTMLTextAreaElement,
  selection: UISelection,
) {
  element[UISelection] = selection
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
  mode: 'replace' | 'modify' = 'replace',
) {
  const valueLength = getUIValue(element).length
  const sanitizeOffset = (o: number) => Math.max(0, Math.min(valueLength, o))

  const anchorOffset =
    mode === 'replace' || element[UISelection] === undefined
      ? sanitizeOffset(anchorOffsetParam)
      : element[UISelection].anchorOffset
  const focusOffset = sanitizeOffset(focusOffsetParam)

  const startOffset = Math.min(anchorOffset, focusOffset)
  const endOffset = Math.max(anchorOffset, focusOffset)

  element[UISelection] = {
    anchorOffset,
    focusOffset,
  }

  if (
    element.selectionStart === startOffset &&
    element.selectionEnd === endOffset
  ) {
    return
  }

  const startObj = Object.assign(new Number(startOffset), {
    [UISelection]: true,
  }) as unknown as number

  try {
    element.setSelectionRange(startObj, endOffset)
  } catch {
    // DOMException for invalid state is expected when calling this
    // on an element without support for setSelectionRange
  }
}

export type UISelectionRange = UISelection & {
  startOffset: number
  endOffset: number
}

export function getUISelection(
  element: HTMLInputElement | HTMLTextAreaElement,
): UISelectionRange {
  const sel = element[UISelection] ?? {
    anchorOffset: element.selectionStart ?? 0,
    focusOffset: element.selectionEnd ?? 0,
  }
  return {
    ...sel,
    startOffset: Math.min(sel.anchorOffset, sel.focusOffset),
    endOffset: Math.max(sel.anchorOffset, sel.focusOffset),
  }
}

export function hasUISelection(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  return !!element[UISelection]
}

/** Flag the IDL selection as clean. This does not change the selection. */
export function setUISelectionClean(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  element[UISelection] = undefined
}
