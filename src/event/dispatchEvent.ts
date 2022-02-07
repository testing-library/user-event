import {Config} from '../setup'
import {EventType} from './types'
import {behavior, BehaviorPlugin} from './behavior'

export function dispatchEvent(config: Config, target: Element, event: Event) {
  const type = event.type as EventType
  const behaviorImplementation = (
    behavior[type] as BehaviorPlugin<EventType> | undefined
  )?.(event, target, config)

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

    target.dispatchEvent(event)

    if (!defaultPrevented as boolean) {
      behaviorImplementation()
    }

    return !defaultPrevented
  }

  return target.dispatchEvent(event)
}
