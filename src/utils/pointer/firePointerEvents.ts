import {createEvent, fireEvent} from '@testing-library/dom'
import {eventMap} from '@testing-library/dom/dist/event-map.js'
import type {pointerState} from '../../pointer/types'
import type {keyboardState} from '../../keyboard/types'
import {getMouseButton, getMouseButtons, MouseButton} from './mouseButtons'
import {getUIEventModifiers} from '../keyboard/getUIEventModifiers'

export function firePointerEvent(
  target: Element,
  type: string,
  {
    pointerState,
    keyboardState,
    pointerType,
    button,
    coords,
    pointerId,
    isPrimary,
    clickCount,
  }: {
    pointerState: pointerState
    keyboardState: keyboardState
    pointerType?: 'mouse' | 'pen' | 'touch'
    button?: MouseButton
    coords?: PointerCoords
    pointerId?: number
    isPrimary?: boolean
    clickCount?: number
  },
) {
  const init: MouseEventInit & PointerEventInit = {
    ...coords,
    ...getUIEventModifiers(keyboardState),
  }
  if (type === 'click' || type.startsWith('pointer')) {
    init.pointerId = pointerId
    init.pointerType = pointerType
  }
  if (['pointerdown', 'pointerup'].includes(type)) {
    init.isPrimary = isPrimary
  }
  init.button = getMouseButton(button ?? 0)
  init.buttons = getMouseButtons(
    ...pointerState.pressed
      .filter(p => p.keyDef.pointerType === pointerType)
      .map(p => p.keyDef.button ?? 0),
  )
  if (
    ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu'].includes(type)
  ) {
    init.detail = clickCount
  }

  const eventKey = Object.keys(eventMap).find(k => k.toLowerCase() === type)
  const event = createEvent[eventKey as keyof typeof createEvent](target, init)

  // see https://github.com/testing-library/react-testing-library/issues/268
  assignPositionInit(event as MouseEvent, init)
  assignPointerInit(event as PointerEvent, init)

  return fireEvent(target, event)
}

export interface PointerCoords {
  x?: number
  y?: number
  clientX?: number
  clientY?: number
  offsetX?: number
  offsetY?: number
  pageX?: number
  pageY?: number
  screenX?: number
  screenY?: number
}

function assignProps(
  obj: MouseEvent | PointerEvent,
  props: MouseEventInit & PointerEventInit & PointerCoords,
) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(obj, key, {get: () => value})
  }
}

function assignPositionInit(
  obj: MouseEvent | PointerEvent,
  {
    x,
    y,
    clientX,
    clientY,
    offsetX,
    offsetY,
    pageX,
    pageY,
    screenX,
    screenY,
  }: PointerCoords,
) {
  assignProps(obj, {
    /* istanbul ignore start */
    x: x ?? clientX ?? 0,
    y: y ?? clientY ?? 0,
    clientX: x ?? clientX ?? 0,
    clientY: y ?? clientY ?? 0,
    offsetX: offsetX ?? 0,
    offsetY: offsetY ?? 0,
    pageX: pageX ?? 0,
    pageY: pageY ?? 0,
    screenX: screenX ?? 0,
    screenY: screenY ?? 0,
    /* istanbul ignore end */
  })
}

function assignPointerInit(
  obj: MouseEvent | PointerEvent,
  {isPrimary, pointerId, pointerType}: PointerEventInit,
) {
  assignProps(obj, {
    isPrimary,
    pointerId,
    pointerType,
  })
}
