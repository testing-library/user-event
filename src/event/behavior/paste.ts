import {input, isEditable} from '../../utils'
import {behavior} from './registry'

behavior.paste = (event, target, config) => {
  if (isEditable(target)) {
    return () => {
      const insertData = event.clipboardData?.getData('text')
      if (insertData) {
        input(config, target, insertData, 'insertFromPaste')
      }
    }
  }
}
