import {dispatchDOMEvent} from '../event'
import {isElementType} from '../utils'
import {
  prepareRangeTextInterceptor,
  prepareSelectionInterceptor,
  prepareValueInterceptor,
} from './interceptor'
import {clearInitialValue, getInitialValue} from './UI'

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
          dispatchDOMEvent(el, 'change')
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
