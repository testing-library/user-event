import {dispatchUIEvent} from '../event'
import {Config} from '../setup'
import {prepareSelectionInterceptor} from './selection'
import {
  getInitialValue,
  prepareValueInterceptor,
  setInitialValue,
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
      const el = e.target as Node

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
      if (typeof initialValue === 'string' && el.value !== initialValue) {
        dispatchUIEvent({} as Config, el, 'change')
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
    prepareSelectionInterceptor(el)
  }

  el[isPrepared] = isPrepared
}

export {getUIValue, setUIValue, startTrackValue, endTrackValue} from './value'
export {getUISelection, setUISelection} from './selection'
export type {UISelectionRange} from './selection'
