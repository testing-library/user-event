import {keyboardKey, keyboardOptions} from './types'

enum bracketDict {
  '{' = '}',
  '[' = ']',
}

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
    releaseSelf,
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

function readNextDescriptor(text: string) {
  let pos = 0
  const startBracket =
    text[pos] in bracketDict ? (text[pos] as keyof typeof bracketDict) : ''

  pos += startBracket.length

  // `foo{{bar` is an escaped char at position 3,
  // but `foo{{{>5}bar` should be treated as `{` pressed down for 5 keydowns.
  const startBracketRepeated = startBracket
    ? (text.match(new RegExp(`^\\${startBracket}+`)) as RegExpMatchArray)[0]
        .length
    : 0
  const isEscapedChar =
    startBracketRepeated === 2 ||
    (startBracket === '{' && startBracketRepeated > 3)

  const type = isEscapedChar ? '' : startBracket

  return {
    type,
    ...(type === '' ? readPrintableChar(text, pos) : readTag(text, pos, type)),
  }
}

function readPrintableChar(text: string, pos: number) {
  const descriptor = text[pos]

  assertDescriptor(descriptor, text, pos)

  pos += descriptor.length

  return {
    consumedLength: pos,
    descriptor,
    releasePrevious: false,
    releaseSelf: true,
    repeat: 1,
  }
}

function readTag(
  text: string,
  pos: number,
  startBracket: keyof typeof bracketDict,
) {
  const releasePreviousModifier = text[pos] === '/' ? '/' : ''

  pos += releasePreviousModifier.length

  const descriptor = text.slice(pos).match(/^\w+/)?.[0]

  assertDescriptor(descriptor, text, pos)

  pos += descriptor.length

  const repeatModifier = text.slice(pos).match(/^>\d+/)?.[0] ?? ''

  pos += repeatModifier.length

  const releaseSelfModifier =
    text[pos] === '/' || (!repeatModifier && text[pos] === '>') ? text[pos] : ''

  pos += releaseSelfModifier.length

  const expectedEndBracket = bracketDict[startBracket]
  const endBracket = text[pos] === expectedEndBracket ? expectedEndBracket : ''

  if (!endBracket) {
    throw new Error(
      getErrorMessage(
        [
          !repeatModifier && 'repeat modifier',
          !releaseSelfModifier && 'release modifier',
          `"${expectedEndBracket}"`,
        ]
          .filter(Boolean)
          .join(' or '),
        text[pos],
        text,
      ),
    )
  }

  pos += endBracket.length

  return {
    consumedLength: pos,
    descriptor,
    releasePrevious: !!releasePreviousModifier,
    repeat: repeatModifier ? Math.max(Number(repeatModifier.substr(1)), 1) : 1,
    releaseSelf: hasReleaseSelf(
      startBracket,
      descriptor,
      releaseSelfModifier,
      repeatModifier,
    ),
  }
}

function assertDescriptor(
  descriptor: string | undefined,
  text: string,
  pos: number,
): asserts descriptor is string {
  if (!descriptor) {
    throw new Error(getErrorMessage('key descriptor', text[pos], text))
  }
}

function getEnumValue<T>(f: Record<string, T>, key: string): T | undefined {
  return f[key]
}

function hasReleaseSelf(
  startBracket: keyof typeof bracketDict,
  descriptor: string,
  releaseSelfModifier: string,
  repeatModifier: string,
) {
  if (releaseSelfModifier) {
    return releaseSelfModifier === '/'
  }

  if (repeatModifier) {
    return false
  }

  if (
    startBracket === '{' &&
    getEnumValue(legacyModifiers, descriptor.toLowerCase())
  ) {
    return false
  }

  return true
}

function mapLegacyKey(descriptor: string) {
  return getEnumValue(legacyKeyMap, descriptor) ?? descriptor
}

function getErrorMessage(
  expected: string,
  found: string | undefined,
  text: string,
) {
  return `Expected ${expected} but found "${found ?? ''}" in "${text}"
    See https://github.com/testing-library/user-event/blob/main/README.md#keyboardtext-options
    for more information about how userEvent parses your input.`
}
