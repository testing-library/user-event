enum bracketDict {
  '{' = '}',
  '[' = ']',
}

type Context = 'pointer' | 'keyboard'

/**
 * Read the next key definition from user input
 *
 * Describe key per `{descriptor}` or `[descriptor]`.
 * Everything else will be interpreted as a single character as descriptor - e.g. `a`.
 * Brackets `{` and `[` can be escaped by doubling - e.g. `foo[[bar` translates to `foo[bar`.
 * A previously pressed key can be released per `{/descriptor}`.
 * Keeping the key pressed can be written as `{descriptor>}`.
 * When keeping the key pressed you can choose how long the key is pressed `{descriptor>3}`.
 * You can then release the key per `{descriptor>3/}` or keep it pressed and continue with the next key.
 */
export function readNextDescriptor(text: string, context: Context) {
  let pos = 0
  const startBracket =
    text[pos] in bracketDict ? (text[pos] as keyof typeof bracketDict) : ''

  pos += startBracket.length

  const isEscapedChar = new RegExp(`^\\${startBracket}{2}`).test(text)

  const type = isEscapedChar ? '' : startBracket

  return {
    type,
    ...(type === ''
      ? readPrintableChar(text, pos, context)
      : readTag(text, pos, type, context)),
  }
}

function readPrintableChar(text: string, pos: number, context: Context) {
  const descriptor = text[pos]

  assertDescriptor(descriptor, text, pos, context)

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
  context: Context,
) {
  const releasePreviousModifier = text[pos] === '/' ? '/' : ''

  pos += releasePreviousModifier.length

  const escapedDescriptor = startBracket === '{' && text[pos] === '\\'

  pos += Number(escapedDescriptor)

  const descriptor = escapedDescriptor
    ? text[pos]
    : text.slice(pos).match(startBracket === '{' ? /^\w+|^[^}>/]/ : /^\w+/)?.[0]

  assertDescriptor(descriptor, text, pos, context)

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
        context,
      ),
    )
  }

  pos += endBracket.length

  return {
    consumedLength: pos,
    descriptor,
    releasePrevious: !!releasePreviousModifier,
    repeat: repeatModifier ? Math.max(Number(repeatModifier.substr(1)), 1) : 1,
    releaseSelf: hasReleaseSelf(releaseSelfModifier, repeatModifier),
  }
}

function assertDescriptor(
  descriptor: string | undefined,
  text: string,
  pos: number,
  context: Context,
): asserts descriptor is string {
  if (!descriptor) {
    throw new Error(getErrorMessage('key descriptor', text[pos], text, context))
  }
}

function hasReleaseSelf(releaseSelfModifier: string, repeatModifier: string) {
  if (releaseSelfModifier) {
    return releaseSelfModifier === '/'
  }

  if (repeatModifier) {
    return false
  }
}

function getErrorMessage(
  expected: string,
  found: string | undefined,
  text: string,
  context: Context,
) {
  return `Expected ${expected} but found "${found ?? ''}" in "${text}"
    See ${
      context === 'pointer'
        ? `https://testing-library.com/docs/user-event/pointer#pressing-a-button-or-touching-the-screen`
        : `https://testing-library.com/docs/user-event/keyboard`
    }
    for more information about how userEvent parses your input.`
}
