import cases from 'jest-in-case'
import {input} from '#src/utils'
import {render, setup} from '#testHelpers'
import {createConfig} from '#src/setup/setup'

cases(
  'on input element',
  ({range, data = '', inputType, value}) => {
    const {element} = setup<HTMLInputElement>(`<input value="abcd"/>`)
    element.setSelectionRange(range[0], range[1])

    input(createConfig(), element, data, inputType)

    expect(element).toHaveValue(value)
  },
  {
    insertText: {
      range: [1, 3],
      data: 'XYZ',
      value: 'aXYZd',
    },
    'deleteContentBackward extended': {
      range: [1, 3],
      inputType: 'deleteContentBackward',
      value: 'ad',
    },
    'deleteContentBackward collapsed': {
      range: [2, 2],
      inputType: 'deleteContentBackward',
      value: 'acd',
    },
    'deleteContentForward extended': {
      range: [1, 3],
      inputType: 'deleteContentForward',
      value: 'ad',
    },
    'deleteContentForward collapsed': {
      range: [2, 2],
      inputType: 'deleteContentForward',
      value: 'abd',
    },
  },
)

cases(
  'on text node',
  ({range, data = '', inputType, textContent}) => {
    const {element} = setup(`<div contenteditable="true">abcd</div>`, {
      selection: {
        focusNode: '//text()',
        anchorOffset: range[0],
        focusOffset: range[1],
      },
    })

    input(createConfig(), element, data, inputType)

    expect(element).toHaveTextContent(textContent)
  },
  {
    insertText: {
      range: [1, 3],
      data: 'XYZ',
      textContent: 'aXYZd',
    },
    'deleteContentBackward extended': {
      range: [1, 3],
      inputType: 'deleteContentBackward',
      textContent: 'ad',
    },
    'deleteContentForward extended': {
      range: [1, 3],
      inputType: 'deleteContentForward',
      textContent: 'ad',
    },
    'deleteContentBackward at start': {
      range: [0, 0],
      inputType: 'deleteContentBackward',
      textContent: 'abcd',
    },
    'deleteContentForward at end': {
      range: [4, 4],
      inputType: 'deleteContentForward',
      textContent: 'abcd',
    },
    'deleteContentBackward collapsed': {
      range: [2, 2],
      inputType: 'deleteContentBackward',
      textContent: 'acd',
    },
    'deleteContentForward collapsed': {
      range: [2, 2],
      inputType: 'deleteContentForward',
      textContent: 'abd',
    },
  },
)

cases(
  'between nodes',
  ({range, data = '', inputType, html}) => {
    const {element} = setup(
      `<div contenteditable="true"><button>a</button><button>b</button><button>c</button><button>d</button></div>`,
      {
        selection: {anchorOffset: range[0], focusOffset: range[1]},
      },
    )

    input(createConfig(), element, data, inputType)

    expect(element.innerHTML).toBe(html)
  },
  {
    insertText: {
      range: [1, 3],
      data: 'XYZ',
      html: '<button>a</button>XYZ<button>d</button>',
    },
    'deleteContentBackward extended': {
      range: [1, 3],
      inputType: 'deleteContentBackward',
      html: '<button>a</button><button>d</button>',
    },
    'deleteContentForward extended': {
      range: [1, 3],
      inputType: 'deleteContentForward',
      html: '<button>a</button><button>d</button>',
    },
    'deleteContentBackward at start': {
      range: [0, 0],
      inputType: 'deleteContentBackward',
      html: '<button>a</button><button>b</button><button>c</button><button>d</button>',
    },
    'deleteContentForward at end': {
      range: [4, 4],
      inputType: 'deleteContentForward',
      html: '<button>a</button><button>b</button><button>c</button><button>d</button>',
    },
    // TODO: implement deleteContent for collapsed range
    // 'deleteContentBackward collapsed': {
    //   range: [2, 2],
    //   inputType: 'deleteContentBackward',
    //   html: '<button>a</button><button>c</button><button>d</button>',
    // },
    // 'deleteContentForward collapsed': {
    //   range: [2, 2],
    //   inputType: 'deleteContentForward',
    //   html: '<button>a</button><button>b</button><button>d</button>',
    // },
  },
)

test('prevent input on `beforeinput` event', () => {
  const {element, eventWasFired} = setup(`<input/>`)
  element.addEventListener(
    'beforeinput',
    e => e.data === 'a' && e.preventDefault(),
  )

  input(createConfig(), element, 'a')

  expect(eventWasFired('beforeinput')).toBe(true)
  expect(eventWasFired('input')).toBe(false)
  expect(element).toHaveValue('')

  input(createConfig(), element, 'b')
  expect(eventWasFired('input')).toBe(true)
  expect(element).toHaveValue('b')
})

cases(
  'maxlength',
  ({html, data, expectedValue}) => {
    const {element, eventWasFired} = render(html)

    input(createConfig(), element, data)

    expect(element).toHaveValue(expectedValue)
    expect(eventWasFired('beforeinput')).toBe(true)
    expect(eventWasFired('input')).toBe(!!expectedValue)
  },
  {
    'on text input': {
      html: `<input maxlength="2"/>`,
      data: '123',
      expectedValue: '12',
    },
    'on textarea': {
      html: `<textarea maxlength="2"/>`,
      data: '123',
      expectedValue: '12',
    },
    'ignore on number': {
      html: `<input type="number" maxlength="2"/>`,
      data: '123',
      expectedValue: 123,
    },
    'ignore empty attribute': {
      html: `<input maxlength=""/>`,
      data: '123',
      expectedValue: '123',
    },
    'skip input when inserting nothing': {
      html: `<input maxlength="0"/>`,
      data: '',
      expectedValue: '',
    },
  },
)
