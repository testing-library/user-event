declare module '@testing-library/dom/dist/event-map.js' {
  import {EventType} from '@testing-library/dom'
  export const eventMap: {
    [k in EventType]: {
      EventType: string
      defaultInit: EventInit
    }
  }
}
