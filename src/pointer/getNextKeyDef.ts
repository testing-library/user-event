import {readNextDescriptor} from '../utils'
import {pointerOptions} from './types'

export function getNextKeyDef(keys: string, {pointerMap}: pointerOptions) {
  const {
    descriptor,
    consumedLength,
    releasePrevious,
    releaseSelf = true,
  } = readNextDescriptor(keys)

  return {
    keyDef: pointerMap.find(p => p.name === descriptor),
    consumedLength,
    releasePrevious,
    releaseSelf,
  }
}
