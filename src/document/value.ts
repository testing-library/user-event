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
  interface PropertyDescriptor {
    [PropertyInterceptor]?: typeof PropertyInterceptor
  }
}

export function prepareValueInterceptor(element: HTMLInputElement) {
  const prototypeDescriptor = Object.getOwnPropertyDescriptor(
    element.constructor.prototype,
    'value',
  )

  if (!prototypeDescriptor?.set || prototypeDescriptor[PropertyInterceptor]) {
    return
  }

  // eslint-disable-next-line accessor-pairs
  Object.defineProperty(element.constructor.prototype, 'value', {
    ...prototypeDescriptor,
    [PropertyInterceptor]: PropertyInterceptor,
    set(v: Value | string) {
      ;(this as Element)[UIValue] = typeof v === 'object' && v[UIValue] ? String(v) : undefined
      ;(prototypeDescriptor.set as typeof prototypeDescriptor.set).call(
        this,
        String(v),
      )
    },
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
