import {input, isEditable} from '../../utils'
import {behavior} from './registry'

behavior.paste = (event, target, config) => {
  if (isEditable(target)) {
    return () => {
      if (event.clipboardData) {
        input(
          config,
          target,
          event.clipboardData.getData('text'),
          'insertFromPaste',
        )
      }
    }
  }
}
