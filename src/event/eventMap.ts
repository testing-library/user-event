import {eventMap as baseEventMap} from '@testing-library/dom/dist/event-map.js'

export const eventMap = {
  ...baseEventMap,

  beforeInput: {
    EventType: 'InputEvent',
    defaultInit: {bubbles: true, cancelable: true, composed: true},
  },
}

export const eventMapKeys: {
  [k in keyof DocumentEventMap]?: keyof typeof eventMap
} = Object.fromEntries(Object.keys(eventMap).map(k => [k.toLowerCase(), k]))
