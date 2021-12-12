import cases from 'jest-in-case'
import {prepareInput} from '#src/utils'
import {setup} from '#testHelpers/utils'

cases(
  'on input element',
  ({range, input = '', inputType, value}) => {
    const {element} = setup<HTMLInputElement>(`<input value="abcd"/>`)
    element.setSelectionRange(range[0], range[1])

    prepareInput(input, element, inputType)?.commit()

    expect(element).toHaveValue(value)
  },
  {
    insertText: {
      range: [1, 3],
      input: 'XYZ',
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
  ({range, input = '', inputType, textContent}) => {
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

    prepareInput(input, element, inputType)?.commit()

    expect(element).toHaveTextContent(textContent)
  },
  {
    insertText: {
      range: [1, 3],
      input: 'XYZ',
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
    // TODO: implement deleteContent for collapsed range
    // 'deleteContentBackward collapsed': {
    //   range: [2, 2],
    //   inputType: 'deleteContentBackward',
    //   textContent: 'acd',
    // },
    // 'deleteContentForward collapsed': {
    //   range: [2, 2],
    //   inputType: 'deleteContentForward',
    //   textContent: 'abd',
    // },
  },
)

cases(
  'between nodes',
  ({range, input = '', inputType, html}) => {
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

    prepareInput(input, element, inputType)?.commit()

    expect(element.innerHTML).toBe(html)
  },
  {
    insertText: {
      range: [1, 3],
      input: 'XYZ',
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
