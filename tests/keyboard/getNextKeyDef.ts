import cases from 'jest-in-case'
import {getNextKeyDef} from '#src/keyboard/getNextKeyDef'
import {defaultKeyMap} from '#src/keyboard/keyMap'
import {keyboardKey} from '#src/keyboard/types'

cases(
  'reference key per',
  ({text, key, code}) => {
    expect(getNextKeyDef(defaultKeyMap, `${text}foo`)).toEqual(
      expect.objectContaining({
        keyDef: expect.objectContaining({
          key,
          code,
        }) as keyboardKey,
        consumedLength: text.length,
      }),
    )
    expect(getNextKeyDef(defaultKeyMap, `${text}/foo`)).toEqual(
      expect.objectContaining({
        keyDef: expect.objectContaining({
          key,
          code,
        }) as keyboardKey,
        consumedLength: text.length,
      }),
    )
  },
  {
    code: {text: '[ControlLeft]', key: 'Control', code: 'ControlLeft'},
    'unimplemented code': {text: '[Foo]', key: 'Unknown', code: 'Foo'},
    key: {text: '{Control}', key: 'Control', code: 'ControlLeft'},
    'unimplemented key': {text: '{Foo}', key: 'Foo', code: 'Unknown'},
    'printable character': {text: 'a', key: 'a', code: 'KeyA'},
    'modifiers as printable characters': {text: '/', key: '/', code: 'Unknown'},
    '{ as printable': {text: '{{', key: '{', code: 'Unknown'},
    '[ as printable': {text: '[[', key: '[', code: 'Unknown'},
  },
)

cases(
  'modifiers',
  ({text, modifiers}) => {
    expect(getNextKeyDef(defaultKeyMap, `${text}foo`)).toEqual(
      expect.objectContaining(modifiers),
    )
  },
  {
    'no releasePrevious': {
      text: '{Control}',
      modifiers: {releasePrevious: false},
    },
    'releasePrevious per key': {
      text: '{/Control}',
      modifiers: {releasePrevious: true},
    },
    'releasePrevious per code': {
      text: '[/ControlLeft]',
      modifiers: {releasePrevious: true},
    },
    'default releaseSelf': {
      text: '{Control}',
      modifiers: {releaseSelf: true},
    },
    'keep key pressed per key': {
      text: '{Control>}',
      modifiers: {releaseSelf: false},
    },
    'keep key pressed per code': {
      text: '[Control>]',
      modifiers: {releaseSelf: false},
    },
    'keep key pressed with repeatModifier': {
      text: '{Control>2}',
      modifiers: {releaseSelf: false},
    },
    'release after repeatModifier': {
      text: '{Control>2/}',
      modifiers: {releaseSelf: true},
    },
  },
)

cases(
  'errors',
  ({text, expectedError}) => {
    expect(() => getNextKeyDef(defaultKeyMap, `${text}`)).toThrow(expectedError)
  },
  {
    'invalid descriptor': {
      text: '{!}',
      expectedError: 'but found "!" in "{!}"',
    },
    'missing descriptor': {
      text: '',
      expectedError: 'but found "" in ""',
    },
    'missing closing bracket': {
      text: '{a)',
      expectedError: 'but found ")" in "{a)"',
    },
    'invalid repeat modifier': {
      text: '{a>e}',
      expectedError: 'but found "e" in "{a>e}"',
    },
    'missing bracket after repeat modifier': {
      text: '{a>3)',
      expectedError: 'but found ")" in "{a>3)"',
    },
  },
)
