import {readNextDescriptor} from '../utils'
import {keyboardKey, keyboardOptions} from './types'

enum legacyModifiers {
  'alt' = 'alt',
  'ctrl' = 'ctrl',
  'meta' = 'meta',
  'shift' = 'shift',
}

enum legacyKeyMap {
  ctrl = 'Control',
  del = 'Delete',
  esc = 'Escape',
  space = ' ',
}

/**
 * Get the next key from keyMap
 *
 * Keys can be referenced by `{key}` or `{special}` as well as physical locations per `[code]`.
 * Everything else will be interpreted as a typed character - e.g. `a`.
 * Brackets `{` and `[` can be escaped by doubling - e.g. `foo[[bar` translates to `foo[bar`.
 * Keeping the key pressed can be written as `{key>}`.
 * When keeping the key pressed you can choose how long (how many keydown and keypress) the key is pressed `{key>3}`.
 * You can then release the key per `{key>3/}` or keep it pressed and continue with the next key.
 * Modifiers like `{shift}` imply being kept pressed. This can be turned of per `{shift/}`.
 */
export function getNextKeyDef(
  text: string,
  options: keyboardOptions,
): {
  keyDef: keyboardKey
  consumedLength: number
  releasePrevious: boolean
  releaseSelf: boolean
  repeat: number
} {
  const {
    type,
    descriptor,
    consumedLength,
    releasePrevious,
    releaseSelf = !(
      type === '{' && getEnumValue(legacyModifiers, descriptor.toLowerCase())
    ),
    repeat,
  } = readNextDescriptor(text)

  const keyDef = options.keyboardMap.find(def => {
    if (type === '[') {
      return def.code?.toLowerCase() === descriptor.toLowerCase()
    } else if (type === '{') {
      const key = mapLegacyKey(descriptor)
      return def.key?.toLowerCase() === key.toLowerCase()
    }
    return def.key === descriptor
  }) ?? {
    key: 'Unknown',
    code: 'Unknown',
    [type === '[' ? 'code' : 'key']: descriptor,
  }

  return {
    keyDef,
    consumedLength,
    releasePrevious,
    releaseSelf,
    repeat,
  }
}

function getEnumValue<T>(f: Record<string, T>, key: string): T | undefined {
  return f[key]
}

function mapLegacyKey(descriptor: string) {
  return getEnumValue(legacyKeyMap, descriptor) ?? descriptor
}
