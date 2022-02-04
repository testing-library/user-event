import {Config} from '../setup'
import {getUIEventModifiers} from '../utils'
import {createEvent, EventTypeInit} from './createEvent'
import {dispatchEvent} from './dispatchEvent'
import {isKeyboardEvent, isMouseEvent} from './eventTypes'
import {EventType, PointerCoords} from './types'
import {wrapEvent} from './wrapEvent'

export type {EventType, PointerCoords}

export function dispatchUIEvent<K extends EventType>(
  config: Config,
  target: Element,
  type: K,
  init?: EventTypeInit<K>,
) {
  if (isMouseEvent(type) || isKeyboardEvent(type)) {
    init = {
      ...init,
      ...getUIEventModifiers(config.keyboardState),
    } as EventTypeInit<K>
  }

  const event = createEvent(type, target, init)

  return wrapEvent(() => dispatchEvent(config, target, event), target)
}

export function bindDispatchUIEvent(config: Config) {
  return dispatchUIEvent.bind(undefined, config)
}
