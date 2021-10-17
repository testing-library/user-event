import {fireEvent} from '@testing-library/dom'
import {prepareValueInterceptor} from './value'

const isPrepared = Symbol('Preparation was already executed')
const initialValue = Symbol('Initial value when element received focus')

declare global {
  interface Node {
    [isPrepared]?: typeof isPrepared
  }
  interface HTMLInputElement {
    [initialValue]?: string | null
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
      if (typeof el[initialValue] === 'string') {
        const newValue = el.value
        if (newValue !== el[initialValue]) {
          fireEvent.change(el)
        }
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
    el[initialValue] = el.value
  }

  if (el[isPrepared]) {
    return
  }

  if ('value' in el) {
    prepareValueInterceptor(el)
  }

  el[isPrepared] = isPrepared
}
