/* eslint-disable @typescript-eslint/no-use-before-define */

import {isClickableInput} from '../../utils'
import {dispatchUIEvent} from '..'
import {BehaviorPlugin} from '.'
import {behavior} from './registry'

behavior.keyup = (event, target, config) => {
  return keyupBehavior[event.key]?.(event, target, config)
}

const keyupBehavior: {
  [key: string]: BehaviorPlugin<'keyup'> | undefined
} = {
  ' ': (event, target, config) => {
    if (isClickableInput(target)) {
      return () => dispatchUIEvent(config, target, 'click')
    }
  },
}
