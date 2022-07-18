import {getWindow, isElementType} from '../utils'
import {prepareInterceptor} from './interceptor'
import {hasUISelection, setUISelection} from './selection'

const UIValue = Symbol('Displayed value in UI')
const InitialValue = Symbol('Initial value to compare on blur')
const TrackChanges = Symbol('Track programmatic changes for React workaround')

type Value = {
  [UIValue]?: typeof UIValue
  toString(): string
}

declare global {
  interface Window {
    REACT_VERSION?: number
  }
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
    startTrackValue(this)
  }

  return {
    applyNative: !!isUI,
    realArgs: sanitizeValue(this, v),
    then: isUI ? undefined : () => trackOrSetValue(this, String(v)),
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

export function prepareValueInterceptor(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  prepareInterceptor(element, 'value', valueInterceptor)
}

export function setUIValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  if (element[InitialValue] === undefined) {
    element[InitialValue] = element.value
  }

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

/** Flag the IDL value as clean. This does not change the value.*/
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

// When the input event happens in the browser, React executes all event handlers
// and if they change state of a controlled value, nothing happens.
// But when we trigger the event handlers in test environment with React@17,
// the changes are rolled back before the state update is applied.
// This results in a reset cursor.
// There might be a better way to work around if we figure out
// why the batched update is executed differently in our test environment.

function isReact17Element(element: Element) {
  return (
    Object.getOwnPropertyNames(element).some(k => k.startsWith('__react')) &&
    getWindow(element).REACT_VERSION === 17
  )
}

function startTrackValue(element: HTMLInputElement | HTMLTextAreaElement) {
  if (!isReact17Element(element)) {
    return
  }

  element[TrackChanges] = {
    previousValue: String(element.value),
    tracked: [],
  }
}

function trackOrSetValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  v: string,
) {
  element[TrackChanges]?.tracked?.push(v)

  if (!element[TrackChanges]) {
    setUIValueClean(element)
    setUISelection(element, {focusOffset: v.length})
  }
}

export function commitValueAfterInput(
  element: HTMLInputElement | HTMLTextAreaElement,
  cursorOffset: number,
) {
  const changes = element[TrackChanges]

  element[TrackChanges] = undefined

  const isJustReactStateUpdate =
    changes?.tracked?.length === 2 &&
    changes.tracked[0] === changes.previousValue &&
    changes.tracked[1] === element.value

  if (isJustReactStateUpdate) {
    if (hasUISelection(element)) {
      setUISelection(element, {focusOffset: cursorOffset})
    }
  } else if (changes?.tracked?.length) {
    setUIValueClean(element)
    if (hasUISelection(element)) {
      setUISelection(element, {focusOffset: element.value.length})
    }
  }
}
