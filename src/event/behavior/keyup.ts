import {isClickableInput} from '../../utils'
import {BehaviorPlugin} from '.'
import {behavior} from './registry'

behavior.keyup = (event, target, instance) => {
  return keyupBehavior[event.key]?.(event, target, instance)
}

const keyupBehavior: {
  [key: string]: BehaviorPlugin<'keyup'> | undefined
} = {
  ' ': (event, target, instance) => {
    if (isClickableInput(target)) {
      return () => instance.dispatchUIEvent(target, 'click')
    }
  },
}
