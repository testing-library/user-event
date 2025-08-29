import {type Instance} from '../setup'
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

/**
 * Dispatch a DOM event without wrapping it with the configured wrapper.
 * This is used internally to trigger events that are not triggered natively by JSDOM.
 * These should not be wrapped explicitly as they are already executed in the triggering wrapped scope.
 */
export function dispatchDOMEvent<K extends EventType>(
  target: Element,
  type: K,
  init?: EventTypeInit<K>,
): boolean {
  return target.dispatchEvent(createEvent(type, target, init))
}
