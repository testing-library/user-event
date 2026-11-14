import {isEditable} from '../../utils'
import {input} from '../input'
import {behavior} from './registry'

behavior.cut = (event, target, instance) => {
  return () => {
    if (isEditable(target)) {
      input(instance, target, '', 'deleteByCut')
    }
  }
}
