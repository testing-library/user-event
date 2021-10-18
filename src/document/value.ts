import {applyNative} from './applyNative'

const UIValue = Symbol('Displayed value in UI')
const InitialValue = Symbol('Initial value to compare on blur')
const PropertyInterceptor = Symbol('Interceptor for set() calls')

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

interface PropertySetter<T = unknown> {
  (v: T): void
  [PropertyInterceptor]?: typeof PropertyInterceptor
}

function makeValueInterceptor(
  realSetter: (this: HTMLInputElement | HTMLTextAreaElement, v: string) => void,
) {
  function valueInterceptor(
    this: HTMLInputElement | HTMLTextAreaElement,
    v: Value | string,
  ) {
    const isUIValue = typeof v === 'object' && v[UIValue]

    this[UIValue] = isUIValue ? String(v) : undefined
    if (!isUIValue) {
      this[InitialValue] = String(v)
    }

    realSetter.call(this, String(v))
  }

  ;(valueInterceptor as PropertySetter<string>)[PropertyInterceptor] =
    PropertyInterceptor

  return valueInterceptor
}

export function prepareValueInterceptor(element: HTMLInputElement) {
  const prototypeDescriptor = Object.getOwnPropertyDescriptor(
    element.constructor.prototype,
    'value',
  )

  if (
    !prototypeDescriptor?.set ||
    (prototypeDescriptor.set as PropertySetter)[PropertyInterceptor]
  ) {
    return
  }

  // eslint-disable-next-line accessor-pairs
  Object.defineProperty(element.constructor.prototype, 'value', {
    ...prototypeDescriptor,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    set: makeValueInterceptor(prototypeDescriptor.set),
  })
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
