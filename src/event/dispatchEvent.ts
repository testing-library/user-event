import {Config} from '../setup'
import {EventType} from './types'
import {behavior, BehaviorPlugin} from './behavior'
import {wrapEvent} from './wrapEvent'

export function dispatchEvent(
  config: Config,
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
        config,
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
