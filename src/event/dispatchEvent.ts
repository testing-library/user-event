import type {Instance} from '../setup'
import {EventType, EventTypeInit} from './types'
import {behavior, BehaviorPlugin} from './behavior'
import {wrapEvent} from './wrapEvent'
import {isKeyboardEvent, isMouseEvent} from './eventMap'
import {createEvent} from './createEvent'

export function dispatchUIEvent<K extends EventType>(
  this: Instance,
  target: Element,
  type: K,
  init?: EventTypeInit<K>,
  preventDefault: boolean = false,
) {
  if (isMouseEvent(type) || isKeyboardEvent(type)) {
    init = {
      ...init,
      ...this.system.getUIEventModifiers(),
    } as EventTypeInit<K>
  }

  const event = createEvent(type, target, init)

  return dispatchEvent.call(this, target, event, preventDefault)
}

export function dispatchEvent(
  this: Instance,
  target: Element,
  event: Event,
  preventDefault: boolean = false,
) {
  const type = event.type as EventType
  const behaviorImplementation = preventDefault
    ? () => {}
    : (behavior[type] as BehaviorPlugin<EventType> | undefined)?.(
        event,
        target,
        this,
      )

  if (behaviorImplementation) {
    event.preventDefault()
    let defaultPrevented = false
    Object.defineProperty(event, 'defaultPrevented', {
      get: () => defaultPrevented,
    })
    Object.defineProperty(event, 'preventDefault', {
      value: () => {
        defaultPrevented = event.cancelable
      },
    })

    wrapEvent(() => target.dispatchEvent(event), target)

    if (!defaultPrevented as boolean) {
      behaviorImplementation()
    }

    return !defaultPrevented
  }

  return wrapEvent(() => target.dispatchEvent(event), target)
}

export function dispatchDOMEvent<K extends EventType>(
  target: Element,
  type: K,
  init?: EventTypeInit<K>,
) {
  const event = createEvent(type, target, init)
  wrapEvent(() => target.dispatchEvent(event), target)
}
