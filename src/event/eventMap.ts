import {eventMap as baseEventMap} from '@testing-library/dom/dist/event-map.js'

export const eventMap = {
  ...baseEventMap,

  beforeInput: {
    EventType: 'InputEvent',
    defaultInit: {bubbles: true, cancelable: true, composed: true},
  },
}
