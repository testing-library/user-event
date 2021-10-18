import {fireEvent} from '@testing-library/dom'
import {
  getInitialValue,
  prepareValueInterceptor,
  setInitialValue,
} from './value'

const isPrepared = Symbol('Preparation was already executed')

declare global {
  interface Node {
    [isPrepared]?: typeof isPrepared
  }
}

export function prepareDocument(document: Document) {
  if (document[isPrepared]) {
    return
  }

  document.addEventListener(
    'focus',
    e => {
      const el = e.target as Node

      prepareElement(el)
    },
    {
      capture: true,
      passive: true,
    },
  )

  if (document.activeElement) {
    prepareElement(document.activeElement)
  }

  document.addEventListener(
    'blur',
    e => {
      const el = e.target as HTMLInputElement
      const initialValue = getInitialValue(el)
      if (typeof initialValue === 'string' && el.value !== initialValue) {
        fireEvent.change(el)
      }
    },
    {
      capture: true,
      passive: true,
    },
  )

  document[isPrepared] = isPrepared
}

function prepareElement(el: Node | HTMLInputElement) {
  if ('value' in el) {
    setInitialValue(el)
  }

  if (el[isPrepared]) {
    return
  }

  if ('value' in el) {
    prepareValueInterceptor(el)
  }

  el[isPrepared] = isPrepared
}