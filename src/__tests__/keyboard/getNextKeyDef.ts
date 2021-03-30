import cases from 'jest-in-case'
import {getNextKeyDef} from 'keyboard/getNextKeyDef'
import {defaultKeyMap} from 'keyboard/keyMap'
import {keyboardKey, keyboardOptions} from 'keyboard/types'

const options: keyboardOptions = {
  document,
  keyboardMap: defaultKeyMap,
  autoModify: false,
  delay: 123,
}

cases(
  'reference key per',
  ({text, key, code}) => {
    expect(getNextKeyDef(`${text}foo`, options)).toEqual(
      expect.objectContaining({
        keyDef: expect.objectContaining({
          key,
          code,
        }) as keyboardKey,
        consumedLength: text.length,
      }),
    )
    expect(getNextKeyDef(`${text}/foo`, options)).toEqual(
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
    'legacy modifier': {text: '{ctrl}', key: 'Control', code: 'ControlLeft'},
    'printable character': {text: 'a', key: 'a', code: 'KeyA'},
    'modifiers as printable characters': {text: '/', key: '/', code: 'Unknown'},
    '{ as printable': {text: '{{', key: '{', code: 'Unknown'},
    '[ as printable': {text: '[[', key: '[', code: 'Unknown'},
  },
)

cases(
  'modifiers',
  ({text, modifiers}) => {
    expect(getNextKeyDef(`${text}foo`, options)).toEqual(
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
    'no releaseSelf on legacy modifier': {
      text: '{ctrl}',
      modifiers: {releaseSelf: false},
    },
    'release legacy modifier': {
      text: '{ctrl/}',
      modifiers: {releaseSelf: true},
    },
  },
)

cases(
  'errors',
  ({text, expectedError}) => {
    expect(() => getNextKeyDef(`${text}`, options)).toThrow(expectedError)
  },
  {
    'invalid descriptor': {
      text: '{!}',
      expectedError: 'Expected key descriptor but found "!" in "{!}"',
    },
    'missing descriptor': {
      text: '',
      expectedError: 'Expected key descriptor but found "" in ""',
    },
    'missing closing bracket': {
      text: '{a)',
      expectedError: 'Expected closing bracket but found ")" in "{a)"',
    },
  },
)
