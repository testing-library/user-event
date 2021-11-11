import {prepareInterceptor} from './interceptor'
import {clearUISelection} from './selection'

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
    [TrackChanges]?: string[]
  }
}

function valueInterceptor(
  this: HTMLInputElement | HTMLTextAreaElement,
  v: Value | string,
) {
  const isUI = typeof v === 'object' && v[UIValue]

  this[UIValue] = isUI ? String(v) : undefined
  if (!isUI) {
    trackValue(this, String(v))

    this[InitialValue] = String(v)

    // Programmatically setting the value property
    // moves the cursor to the end of the input.
    clearUISelection(this)
  }

  return {
    applyNative: !!isUI,
    realArgs: String(v),
  }
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

export function startTrackValue(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  element[TrackChanges] = []
}

function trackValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  v: string,
) {
  element[TrackChanges]?.push(v)
}

export function endTrackValue(element: HTMLInputElement | HTMLTextAreaElement) {
  const tracked = element[TrackChanges]

  element[TrackChanges] = undefined

  return tracked
}
