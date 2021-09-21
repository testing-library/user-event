import {keyboardKey, keyboardOptions} from './types'

/**
 * Get the next key from keyMap
 *
 * Keys can be referenced by `{key}` or `{special}` as well as physical locations per `[code]`.
 * Everything else will be interpreted as a typed character - e.g. `a`.
 * Brackets `{` and `[` can be escaped by doubling - e.g. `foo[[bar` translates to `foo[bar`.
 * Keeping the key pressed can be written as `{key>}`.
 * Modifiers like `{shift}` imply being kept pressed. This can be turned of per `{shift/}`.
 */
// eslint-disable-next-line complexity
export function getNextKeyDef(
  text: string,
  options: keyboardOptions,
): {
  keyDef: keyboardKey
  consumedLength: number
  releasePrevious: boolean
  releaseSelf: boolean
  fireKeyDownTimes: number
} {
  const bracketDict: {[key: string]: string | undefined} = {
    '{': '}',
    '[': ']',
  }
  const startModifiers = ['/']
  const endModifiers = ['/', '>']

  const startBracket = text[0] in bracketDict ? text[0] : ''
  const startModifier =
    startBracket && startModifiers.includes(text[1]) ? text[1] : ''

  const descriptorStart = startBracket.length + startModifier.length
  const descriptor = startBracket
    ? text[descriptorStart] === startBracket
      ? startBracket
      : text.slice(descriptorStart).match(/^\w+/)?.[0]
    : text[descriptorStart]

  if (!descriptor) {
    throw new Error(
      getErrorMessage('key descriptor', text[descriptorStart], text),
    )
  }

  const descriptorEnd = descriptorStart + descriptor.length
  const endModifier =
    startBracket &&
    descriptor !== startBracket &&
    endModifiers.includes(text[descriptorEnd])
      ? text[descriptorEnd]
      : ''

  const endBracket = bracketDict[startBracket] ?? ''

  let repeatModifier = ''
  if (endBracket) {
    let charPosition = descriptorEnd + endModifier.length

    while (text[charPosition] !== endBracket || !text[charPosition]) {
      const maybeNumber = parseInt(text[charPosition], 10)
      if (isNaN(maybeNumber)) {
        throw new Error('expected number')
      }

      repeatModifier += text[charPosition]
      charPosition++
    }
  }

  const modifiers = {
    consumedLength: [
      startBracket,
      startModifier,
      descriptor,
      endModifier,
      repeatModifier,
      endBracket,
    ]
      .map(c => c.length)
      .reduce((a, b) => a + b),

    releasePrevious: startModifier === '/',
    releaseSelf: hasReleaseSelf(startBracket, descriptor, endModifier),
    fireKeyDownTimes: repeatModifier ? parseInt(repeatModifier, 10) : 0,
  }

  if (isPrintableCharacter(startBracket, descriptor)) {
    return {
      ...modifiers,
      keyDef: options.keyboardMap.find(k => k.key === descriptor) ?? {
        key: descriptor,
        code: 'Unknown',
      },
    }
  } else if (startBracket === '{') {
    const key = mapLegacyKey(descriptor)
    return {
      ...modifiers,
      keyDef: options.keyboardMap.find(
        k => k.key?.toLowerCase() === key.toLowerCase(),
      ) ?? {key: descriptor, code: 'Unknown'},
    }
  } else {
    return {
      ...modifiers,
      keyDef: options.keyboardMap.find(
        k => k.code?.toLowerCase() === descriptor.toLowerCase(),
      ) ?? {key: 'Unknown', code: descriptor},
    }
  }
}

function hasReleaseSelf(
  startBracket: string,
  descriptor: string,
  endModifier: string,
) {
  if (endModifier === '/' || !startBracket) {
    return true
  }
  if (
    startBracket === '{' &&
    ['alt', 'ctrl', 'meta', 'shift'].includes(descriptor.toLowerCase())
  ) {
    return false
  }
  return endModifier !== '>'
}

function mapLegacyKey(descriptor: string) {
  return (
    {
      ctrl: 'Control',
      del: 'Delete',
      esc: 'Escape',
      space: ' ',
    }[descriptor] ?? descriptor
  )
}

function isPrintableCharacter(startBracket: string, descriptor: string) {
  return (
    !startBracket ||
    startBracket === descriptor ||
    (startBracket === '{' && descriptor.length === 1)
  )
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
