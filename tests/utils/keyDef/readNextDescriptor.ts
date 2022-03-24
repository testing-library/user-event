import cases from 'jest-in-case'
import {readNextDescriptor} from '#src/utils'
import userEvent from '#src'

cases(
  'errors',
  ({text, expectedError}) => {
    expect(() => readNextDescriptor(`${text}`, 'keyboard')).toThrow(
      expectedError,
    )
  },
  {
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
    'unescaped modifier': {
      text: '{/>5}',
      expectedError: 'but found ">" in "{/>5}"',
    },
  },
)

test('include appropriate docs link in error message', async () => {
  await expect(() => userEvent.keyboard('{')).rejects.toThrow(
    'docs/user-event/keyboard',
  )
  await expect(() => userEvent.pointer('{')).rejects.toThrow(
    'docs/user-event/pointer',
  )
})
