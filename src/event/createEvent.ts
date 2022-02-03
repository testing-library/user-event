import {createEvent as createEventBase} from '@testing-library/dom'
import {eventMap} from '@testing-library/dom/dist/event-map.js'
import {isMouseEvent} from './eventTypes'
import {EventType, PointerCoords} from './types'

export type EventTypeInit<K extends EventType> = SpecificEventInit<
  FixedDocumentEventMap[K]
>

interface FixedDocumentEventMap extends DocumentEventMap {
  input: InputEvent
}

type SpecificEventInit<E extends Event> = E extends InputEvent
  ? InputEventInit
  : E extends ClipboardEvent
  ? ClipboardEventInit
  : E extends KeyboardEvent
  ? KeyboardEventInit
  : E extends PointerEvent
  ? PointerEventInit
  : E extends MouseEvent
  ? MouseEventInit
  : E extends UIEvent
  ? UIEventInit
  : EventInit

export function createEvent<K extends EventType>(
  type: K,
  target: Element,
  init?: EventTypeInit<K>,
) {
  const eventKey = Object.keys(eventMap).find(
    k => k.toLowerCase() === type,
  ) as keyof typeof createEventBase

  const event = createEventBase[eventKey](target, init) as DocumentEventMap[K]

  // Can not use instanceof, as MouseEvent might be polyfilled.
  if (isMouseEvent(type) && init) {
    // see https://github.com/testing-library/react-testing-library/issues/268
    assignPositionInit(event as MouseEvent, init)
    assignPointerInit(event as PointerEvent, init)
  }

  return event
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
  }: PointerCoords & MouseEventInit,
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
