import {isEditable} from '../../utils'
import {input} from '../input'
import {behavior} from './registry'

behavior.paste = (event, target, instance) => {
  if (isEditable(target)) {
    return () => {
      const insertData = event.clipboardData?.getData('text')
      if (insertData) {
        input(instance, target, insertData, 'insertFromPaste')
      }
    }
  }
}
