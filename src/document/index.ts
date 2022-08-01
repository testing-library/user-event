import {dispatchUIEvent} from '../event'
import {Config} from '../setup'
import {isElementType} from '../utils'
import {prepareSelectionInterceptor} from './selection'
import {prepareRangeTextInterceptor} from './setRangeText'
import {
  clearInitialValue,
  getInitialValue,
  prepareValueInterceptor,
} from './value'

const isPrepared = Symbol('Node prepared with document state workarounds')

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
      const el = e.target as Element

      prepareElement(el)
    },
    {
      capture: true,
      passive: true,
    },
  )

  // Our test environment defaults to `document.body` as `activeElement`.
  // In other environments this might be `null` when preparing.
  // istanbul ignore else
  if (document.activeElement) {
    prepareElement(document.activeElement)
  }

  document.addEventListener(
    'blur',
    e => {
      const el = e.target as HTMLInputElement
      const initialValue = getInitialValue(el)
      if (initialValue !== undefined) {
        if (el.value !== initialValue) {
          dispatchUIEvent({} as Config, el, 'change')
        }
        clearInitialValue(el)
      }
    },
    {
      capture: true,
      passive: true,
    },
  )

  document[isPrepared] = isPrepared
}

function prepareElement(el: Element) {
  if (el[isPrepared]) {
    return
  }

  if (isElementType(el, ['input', 'textarea'])) {
    prepareValueInterceptor(el)
    prepareSelectionInterceptor(el)
    prepareRangeTextInterceptor(el)
  }

  el[isPrepared] = isPrepared
}

export {
  getUIValue,
  setUIValue,
  commitValueAfterInput,
  clearInitialValue,
} from './value'
export {getUISelection, setUISelection} from './selection'
export type {UISelectionRange} from './selection'
