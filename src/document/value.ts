import {isElementType} from '../utils'
import {prepareInterceptor} from './interceptor'
import {setUISelection} from './selection'

const UIValue = Symbol('Displayed value in UI')
const InitialValue = Symbol('Initial value to compare on blur')
const TrackChanges = Symbol('Track programmatic changes for React workaround')

type Value = {
  [UIValue]?: typeof UIValue
  toString(): string
}

declare global {
  interface Element {
    [UIValue]?: string
    [InitialValue]?: string
    [TrackChanges]?: {
      previousValue?: string
      tracked?: string[]
      nextValue?: string
    }
  }
}

function valueInterceptor(
  this: HTMLInputElement | HTMLTextAreaElement,
  v: Value | string,
) {
  const isUI = typeof v === 'object' && v[UIValue]

  if (isUI) {
    this[UIValue] = String(v)
    setPreviousValue(this, String(this.value))
  } else {
    trackOrSetValue(this, String(v))
  }

  return {
    applyNative: !!isUI,
    realArgs: sanitizeValue(this, v),
  }
}

function sanitizeValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  v: Value | string,
) {
  // Workaround for JSDOM
  if (
    isElementType(element, 'input', {type: 'number'}) &&
    String(v) !== '' &&
    !Number.isNaN(Number(v))
  ) {
    // Setting value to "1." results in `null` in JSDOM
    return String(Number(v))
  }
  return String(v)
}

export function prepareValueInterceptor(element: HTMLInputElement) {
  prepareInterceptor(element, 'value', valueInterceptor)
}

export function setUIValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  element.value = {
    [UIValue]: UIValue,
    toString: () => value,
  } as unknown as string
}

export function getUIValue(element: HTMLInputElement | HTMLTextAreaElement) {
  return element[UIValue] === undefined
    ? element.value
    : String(element[UIValue])
}

export function setInitialValue(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  element[InitialValue] = element.value
}

export function getInitialValue(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  return element[InitialValue]
}

function setPreviousValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  v: string,
) {
  element[TrackChanges] = {...element[TrackChanges], previousValue: v}
}

export function startTrackValue(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  element[TrackChanges] = {
    ...element[TrackChanges],
    nextValue: String(element.value),
    tracked: [],
  }
}

function trackOrSetValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  v: string,
) {
  element[TrackChanges]?.tracked?.push(v)

  if (!element[TrackChanges]?.tracked) {
    setCleanValue(element, v)
  }
}

function setCleanValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  v: string,
) {
  element[UIValue] = undefined
  element[InitialValue] = v

  // Programmatically setting the value property
  // moves the cursor to the end of the input.
  setUISelection(element, {focusOffset: v.length})
}

/**
 * @returns `true` if we recognize a React state reset and update
 */
export function endTrackValue(element: HTMLInputElement | HTMLTextAreaElement) {
  const changes = element[TrackChanges]

  element[TrackChanges] = undefined

  const isJustReactStateUpdate =
    changes?.tracked?.length === 2 &&
    changes.tracked[0] === changes.previousValue &&
    changes.tracked[1] === changes.nextValue

  if (changes?.tracked?.length && !isJustReactStateUpdate) {
    setCleanValue(element, changes.tracked[changes.tracked.length - 1])
  }

  return isJustReactStateUpdate
}
