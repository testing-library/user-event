import {createEvent, EventType, EventTypeInit, fireEvent} from '../utils'

export function dispatchUIEvent<K extends EventType>(
  target: Element,
  type: K,
  init?: EventTypeInit<K>,
) {
  return fireEvent(target, createEvent(type, target, init))
}
