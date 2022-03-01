import {input, isEditable} from '../../utils'
import {behavior} from './registry'

behavior.cut = (event, target, config) => {
  return () => {
    if (isEditable(target)) {
      input(config, target, '', 'deleteByCut')
    }
  }
}
