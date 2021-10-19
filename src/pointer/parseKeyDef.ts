import {readNextDescriptor} from '../utils'
import {pointerKey, pointerOptions} from './types'

export function parseKeyDef(keys: string, {pointerMap}: pointerOptions) {
  const defs: Array<{
    keyDef: pointerKey
    releasePrevious: boolean
    releaseSelf: boolean
  }> = []

  do {
    const {
      descriptor,
      consumedLength,
      releasePrevious,
      releaseSelf = true,
    } = readNextDescriptor(keys)
    const keyDef = pointerMap.find(p => p.name === descriptor)

    if (keyDef) {
      defs.push({keyDef, releasePrevious, releaseSelf})
    }

    keys = keys.slice(consumedLength)
  } while (keys)

  return defs
}
