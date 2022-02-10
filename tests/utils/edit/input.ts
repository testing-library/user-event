import cases from 'jest-in-case'
import {input} from '#src/utils'
import {setup} from '#testHelpers'
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
    const {element} = setup(`<div contenteditable="true">abcd</div>`)
    element.focus()
    document
      .getSelection()
      ?.setBaseAndExtent(
        element.firstChild as ChildNode,
        range[0],
        element.firstChild as ChildNode,
        range[1],
      )

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
    )
    element.focus()
    document
      .getSelection()
      ?.setBaseAndExtent(
        element as ChildNode,
        range[0],
        element as ChildNode,
        range[1],
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
