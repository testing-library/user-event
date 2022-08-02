import {Config} from '../setup'
import {createEvent} from './createEvent'
import {dispatchEvent} from './dispatchEvent'
import {isKeyboardEvent, isMouseEvent} from './eventMap'
import {EventType, EventTypeInit, PointerCoords} from './types'

export type {EventType, PointerCoords}

export function dispatchUIEvent<K extends EventType>(
  config: Config,
  target: Element,
  type: K,
  init?: EventTypeInit<K>,
  preventDefault: boolean = false,
) {
  if (isMouseEvent(type) || isKeyboardEvent(type)) {
    init = {
      ...init,
      ...config.system.getUIEventModifiers(),
    } as EventTypeInit<K>
  }

  const event = createEvent(type, target, init)

  return dispatchEvent(config, target, event, preventDefault)
}

export function bindDispatchUIEvent(config: Config) {
  return dispatchUIEvent.bind(undefined, config)
}
