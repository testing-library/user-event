import {keyboardKey, modernTypeOptions} from './types'

/**
 * Get the next key from keyMap
 *
 * Keys can be referenced by `{key}` or `{special}` as well as physical locations per `[code]`.
 * Everything else will be interpreted as a typed character - e.g. `a`.
 * Brackets `{` and `[` can be escaped by doubling - e.g. `foo[[bar` translates to `foo[bar`.
 * Keeping the key pressed can be written as `{key>}`.
 * Modifiers like `{shift}` imply being kept pressed. This can be turned of per `{shift/}`.
 */
export function getNextKeyDef(
  text: string,
  options: modernTypeOptions,
): {
  keyDef: keyboardKey
  consumedLength: number
  releasePrevious: boolean
  releaseSelf: boolean
} {
  const startBracket = ['{', '['].includes(text[0]) ? text[0] : ''
  const startModifier = text[1] === '/' ? '/' : ''

  const descriptorStart = startBracket.length + startModifier.length
  const descriptor = startBracket
    ? text[descriptorStart] === startBracket
      ? startBracket
      : text.slice(descriptorStart).match(/^\w+/)?.[0]
    : text[descriptorStart]

  // istanbul ignore if
  if (!descriptor) {
    throw new Error(
      `Expected key descriptor but found "${text[descriptorStart]}" in "${text}`,
    )
  }

  const descriptorEnd = descriptorStart + descriptor.length
  const endModifier =
    descriptor !== startBracket && ['/', '>'].includes(text[descriptorEnd])
      ? text[descriptorEnd]
      : ''

  const endBracket =
    (!startBracket || descriptor === startBracket) ? '' : startBracket === '{' ? '}' : ']'

  // istanbul ignore if
  if (endBracket && text[descriptorEnd + endModifier.length] !== endBracket) {
    throw new Error(
      `Expected closing bracket but found "${text[descriptorEnd + endModifier.length]}" in "${text}`,
    )
  }

  const modifiers = {
    consumedLength: [
      startBracket,
      startModifier,
      descriptor,
      endModifier,
      endBracket,
    ]
      .map(c => c.length)
      .reduce((a, b) => a + b),

    releasePrevious: startModifier === '/',
    releaseSelf: hasReleaseSelf(startBracket, descriptor, endModifier),
  }

  if (!startBracket || (startBracket === '{' && descriptor.length === 1)) {
    return {
      ...modifiers,
      keyDef: options.keyboardMap.find(
        k => k.key === descriptor,
      ) ?? { key: descriptor, code: 'Unknown'},
    }
  } else if (startBracket === '{') {
    return {
      ...modifiers,
      keyDef: options.keyboardMap.find(
        k => k.key?.toLowerCase() === descriptor.toLowerCase(),
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

function hasReleaseSelf(startBracket: string, descriptor: string, endModifier: string) {
  if (endModifier === '/' || !startBracket) {
    return true
  }
  if (startBracket === '{' && ['alt', 'control', 'meta', 'shift'].includes(descriptor.toLowerCase())) {
    return false
  }
  return endModifier === '>'
}
