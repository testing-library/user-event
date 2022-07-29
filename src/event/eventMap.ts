import {eventMap as baseEventMap} from '@testing-library/dom/dist/event-map.js'
import {EventType} from './types'

export const eventMap = {
  ...baseEventMap,

  auxclick: {
    // like other events this should be PointerEvent, but there this doesn't work in Jsdom
    EventType: 'MouseEvent',
    defaultInit: {bubbles: true, cancelable: true, composed: true},
  },
  beforeInput: {
    EventType: 'InputEvent',
    defaultInit: {bubbles: true, cancelable: true, composed: true},
  },
}

export const eventMapKeys: {
  [k in keyof DocumentEventMap]?: keyof typeof eventMap
} = Object.fromEntries(Object.keys(eventMap).map(k => [k.toLowerCase(), k]))

function getEventClass(type: EventType) {
  const k = eventMapKeys[type]
  return k && eventMap[k].EventType
}

const mouseEvents = ['MouseEvent', 'PointerEvent']
export function isMouseEvent(type: EventType) {
  return mouseEvents.includes(getEventClass(type) as string)
}

export function isKeyboardEvent(type: EventType) {
  return getEventClass(type) === 'KeyboardEvent'
}
