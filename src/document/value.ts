import {applyNative} from './applyNative'
import {prepareInterceptor} from './interceptor'
import {clearUISelection} from './selection'

const UIValue = Symbol('Displayed value in UI')
const InitialValue = Symbol('Initial value to compare on blur')

type Value = {
  [UIValue]?: typeof UIValue
  toString(): string
}

declare global {
  interface Element {
    [UIValue]?: string
    [InitialValue]?: string
  }
}

function valueInterceptor(
  this: HTMLInputElement | HTMLTextAreaElement,
  v: Value | string,
) {
  const isUI = typeof v === 'object' && v[UIValue]

  this[UIValue] = isUI ? String(v) : undefined
  if (!isUI) {
    this[InitialValue] = String(v)

    // Programmatically setting the value property
    // moves the cursor to the end of the input.
    clearUISelection(this)
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
  applyNative(element, 'value', {
    [UIValue]: UIValue,
    toString: () => value,
  } as unknown as string)
}

export function getUIValue(element: HTMLInputElement | HTMLTextAreaElement) {
  return element[UIValue] === undefined ? element.value : element[UIValue]
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
