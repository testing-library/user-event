import {readNextDescriptor} from '../utils'
import {keyboardKey} from './types'

/**
 * Parse key defintions per `keyboardMap`
 *
 * Keys can be referenced by `{key}` or `{special}` as well as physical locations per `[code]`.
 * Everything else will be interpreted as a typed character - e.g. `a`.
 * Brackets `{` and `[` can be escaped by doubling - e.g. `foo[[bar` translates to `foo[bar`.
 * Keeping the key pressed can be written as `{key>}`.
 * When keeping the key pressed you can choose how long (how many keydown and keypress) the key is pressed `{key>3}`.
 * You can then release the key per `{key>3/}` or keep it pressed and continue with the next key.
 */
export function parseKeyDef(keyboardMap: keyboardKey[], text: string) {
  const defs: Array<{
    keyDef: keyboardKey
    releasePrevious: boolean
    releaseSelf: boolean
    repeat: number
  }> = []

  do {
    const {
      type,
      descriptor,
      consumedLength,
      releasePrevious,
      releaseSelf = true,
      repeat,
    } = readNextDescriptor(text, 'keyboard')

    const keyDef = keyboardMap.find(def => {
      if (type === '[') {
        return def.code?.toLowerCase() === descriptor.toLowerCase()
      } else if (type === '{') {
        return def.key?.toLowerCase() === descriptor.toLowerCase()
      }
      return def.key === descriptor
    }) ?? {
      key: 'Unknown',
      code: 'Unknown',
      [type === '[' ? 'code' : 'key']: descriptor,
    }

    defs.push({keyDef, releasePrevious, releaseSelf, repeat})

    text = text.slice(consumedLength)
  } while (text)

  return defs
}
