import {dispatchDOMEvent} from '../event'
import {updateSelectionOnFocus} from '../event/selection/updateSelectionOnFocus'
import {getActiveElement, hasOwnSelection, isElementType} from '../utils'
import {
  prepareRangeTextInterceptor,
  prepareSelectionInterceptor,
  prepareValueInterceptor,
} from './interceptor'
import {clearInitialValue, getInitialValue, hasUISelection} from './UI'

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
      // Focus on elements in a shadow tree is retargeted to the shadow host.
      const el = (e.composedPath()[0] ?? e.target) as Element

      prepareElement(el)
    },
    {
      capture: true,
      passive: true,
    },
  )

  // Our test environment defaults to `document.body` as `activeElement`.
  // In other environments this might be `null` when preparing.
  const activeElement = getActiveElement(document)
  // istanbul ignore else
  if (activeElement) {
    prepareElement(activeElement)
  }

  document.addEventListener(
    'blur',
    e => {
      const el = (e.composedPath()[0] ?? e.target) as HTMLInputElement
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

  // Focus might also be moved per `HTMLElement.focus()`,
  // e.g. by an event handler reacting to a `click`.
  // Only react if focus actually moved to the element,
  // not to a `focus` event dispatched on an element that already had focus.
  let focused = document.activeElement
  document.addEventListener(
    'focus',
    e => {
      const el = e.target as Element
      if (el === document.activeElement && el !== focused) {
        focused = el
        // Browsers might reset the selection of an element with own selection
        // implementation when the document selection is moved to it.
        // Focusing per `HTMLElement.focus()` retains the programmatic selection.
        if (hasOwnSelection(el) && !hasUISelection(el)) {
          const {selectionStart, selectionEnd} = el
          updateSelectionOnFocus(el)
          if (
            el.selectionStart !== selectionStart ||
            el.selectionEnd !== selectionEnd
          ) {
            el.setSelectionRange(selectionStart, selectionEnd)
          }
        } else {
          updateSelectionOnFocus(el)
        }
      }
    },
    {
      capture: true,
      passive: true,
    },
  )
  document.addEventListener(
    'blur',
    e => {
      if (e.target === focused && e.target !== document.activeElement) {
        focused = null
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
