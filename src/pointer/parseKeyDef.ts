import {readNextDescriptor} from '../utils'
import {pointerKey} from './types'

export function parseKeyDef(pointerMap: pointerKey[], keys: string) {
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
