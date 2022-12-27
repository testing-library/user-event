declare module '@testing-library/dom/dist/event-map.js' {
  import {EventType} from '@testing-library/dom'
  export const eventMap: {
    [k in EventType]: {
      EventType: EventInterface
      defaultInit: EventInit
    }
  }
}

type EventInterface =
  | 'AnimationEvent'
  | 'ClipboardEvent'
  | 'CompositionEvent'
  | 'DragEvent'
  | 'Event'
  | 'FocusEvent'
  | 'InputEvent'
  | 'KeyboardEvent'
  | 'MouseEvent'
  | 'PointerEvent'
  | 'PopStateEvent'
  | 'ProgressEvent'
  | 'TouchEvent'
  | 'TransitionEvent'
  | 'UIEvent'
