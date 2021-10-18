import {applyNative} from './applyNative'

const UIValue = Symbol('Displayed value in UI')
const PropertyInterceptor = Symbol('Interceptor for set() calls')

type Value = {
  [UIValue]?: typeof UIValue
  toString(): string
}

declare global {
  interface Element {
    [UIValue]?: string
  }
}

interface PropertySetter<T = unknown> {
  (v: T): void
  [PropertyInterceptor]?: typeof PropertyInterceptor
}

function makeValueInterceptor(realSetter: (this: Element, v: string) => void) {
  function valueInterceptor(this: Element, v: Value | string) {
    this[UIValue] = typeof v === 'object' && v[UIValue] ? String(v) : undefined
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
