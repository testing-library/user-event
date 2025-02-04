import cases from 'jest-in-case'
import {render, setup} from '#testHelpers'
import {createConfig, createInstance} from '#src/setup/setup'
import {getUIValue} from '#src/document'
import {input} from '#src/event'

function setupInstance() {
  return createInstance(createConfig()).instance
}

;[`<input value="abcd"/>`, `<textarea>abcd</textarea>`].forEach(html => {
  cases(
    `input on ${html}`,
    ({
      range,
      data = '',
      inputType = 'insertText',
      value,
      expectInput = true,
    }) => {
      const {element, getEvents, eventWasFired} = render<HTMLInputElement>(
        html,
        {
          selection: {anchorOffset: range[0], focusOffset: range[1]},
        },
      )

      input(setupInstance(), element, data, inputType)

      expect(element).toHaveValue(value)
      expect(getEvents('beforeinput')[0]).toHaveProperty('data', data)
      expect(getEvents('beforeinput')[0]).toHaveProperty('inputType', inputType)
      expect(eventWasFired('input')).toBe(expectInput)
      if (expectInput) {
        expect(getEvents('input')[0]).toHaveProperty('data', data)
        expect(getEvents('input')[0]).toHaveProperty('inputType', inputType)
      }
    },
    {
      'insertText': {
        range: [1, 3],
        data: 'XYZ',
        value: 'aXYZd',
      },
      'overwrite content with same value': {
        range: [1, 2],
        data: 'b',
        value: 'abcd',
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
      'deleteContentBackward at start': {
        range: [0, 0],
        inputType: 'deleteContentBackward',
        value: 'abcd',
        expectInput: false,
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
      'deleteContentForward at end': {
        range: [4, 4],
        inputType: 'deleteContentForward',
        value: 'abcd',
        expectInput: false,
      },
    },
  )
})

cases(
  'on text node',
  ({
    range,
    data = '',
    inputType = 'insertText',
    textContent,
    expectInput = true,
  }) => {
    const {element, getEvents, eventWasFired} = render(
      `<div contenteditable="true">abcd</div>`,
      {
        selection: {
          focusNode: './/text()',
          anchorOffset: range[0],
          focusOffset: range[1],
        },
      },
    )

    input(setupInstance(), element, data, inputType)

    expect(element).toHaveTextContent(textContent)
    expect(getEvents('beforeinput')[0]).toHaveProperty('data', data)
    expect(getEvents('beforeinput')[0]).toHaveProperty('inputType', inputType)
    expect(eventWasFired('input')).toBe(expectInput)
    if (expectInput) {
      // TODO: add data property on input event
      // expect(getEvents('input')[0]).toHaveProperty('data', data)
      expect(getEvents('input')[0]).toHaveProperty('inputType', inputType)
    }
  },
  {
    'insertText': {
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
      expectInput: false,
    },
    'deleteContentForward at end': {
      range: [4, 4],
      inputType: 'deleteContentForward',
      textContent: 'abcd',
      expectInput: false,
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
  ({range, data = '', inputType = 'insertText', html, expectInput = true}) => {
    const {element, getEvents, eventWasFired} = render(
      `<div contenteditable="true"><button>a</button><button>b</button><button>c</button><button>d</button></div>`,
      {
        selection: {anchorOffset: range[0], focusOffset: range[1]},
      },
    )

    input(setupInstance(), element, data, inputType)

    expect(element.innerHTML).toBe(html)
    expect(getEvents('beforeinput')[0]).toHaveProperty('data', data)
    expect(getEvents('beforeinput')[0]).toHaveProperty('inputType', inputType)
    expect(eventWasFired('input')).toBe(expectInput)
    if (expectInput) {
      // TODO: add data property on input event
      // expect(getEvents('input')[0]).toHaveProperty('data', data)
      expect(getEvents('input')[0]).toHaveProperty('inputType', inputType)
    }
  },
  {
    'insertText': {
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
      expectInput: false,
    },
    'deleteContentForward at end': {
      range: [4, 4],
      inputType: 'deleteContentForward',
      html: '<button>a</button><button>b</button><button>c</button><button>d</button>',
      expectInput: false,
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
  const {element, eventWasFired} = render(`<input/>`)
  element.addEventListener(
    'beforeinput',
    e => e.data === 'a' && e.preventDefault(),
  )

  input(setupInstance(), element, 'a')

  expect(eventWasFired('beforeinput')).toBe(true)
  expect(eventWasFired('input')).toBe(false)
  expect(element).toHaveValue('')

  input(setupInstance(), element, 'b')
  expect(eventWasFired('input')).toBe(true)
  expect(element).toHaveValue('b')
})

cases(
  'maxlength',
  ({html, data, inputType, expectedValue, selection}) => {
    const {element, eventWasFired} = render(html)

    if (selection) {
      (element as HTMLInputElement).setSelectionRange(selection[0], selection[1])
    }

    input(setupInstance(), element, data, inputType)

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
    'delete data when maxlength is reached': {
      html: `<input maxlength="3" value="foo"/>`,
      data: '',
      inputType: 'deleteContentForward',
      expectedValue: 'oo',
    },
    'account for selection': {
      html: `<input value="123" maxlength="3"/>`,
      selection: [1, 2],
      data: '4',
      expectedValue: '143',
    },
  },
)

test('edit `<input type="date"/>`', async () => {
  const {element} = setup<HTMLInputElement>('<input type="date" />')

  Array.from('2020-06-29').forEach(key => {
    input(setupInstance(), element, key)
  })

  expect(element).toHaveValue('2020-06-29')
})

cases(
  'edit `<input type="time"/>`',
  ({data, value}) => {
    const {element} = setup('<input type="time" />')

    Array.from(data).forEach(key => {
      input(setupInstance(), element, key)
    })

    expect(element).toHaveValue(value)
  },
  {
    'type time': {data: '01:05', value: '01:05'},
    'type time without `:`': {data: '0105', value: '01:05'},
    'correct values out of range': {data: '23:90', value: '23:59'},
    'overflow digit': {data: '9:25', value: '09:25'},
    'overflow hours': {data: '24:52', value: '23:52'},
    'ignore invalid characters': {data: '1a6bc36abd', value: '16:36'},
  },
)

test.each([
  ['1e--5', 1e-5, '1e-5', 4],
  ['1--e--5', null, '1--e5', 5],
  ['.-1.-e--5', null, '.-1-e5', 6],
  ['1.5e--5', 1.5e-5, '1.5e-5', 6],
  ['1e5-', 1e5, '1e5', 3],
  ['-a3', -3, '-3', 2],
  ['3-3', null, '3-3', 3],
])(
  'type invalid values into <input type="number"/>',
  (data, expectedValue, expectedUiValue, expectedInputEvents) => {
    const {element, getEvents} = setup<HTMLInputElement>(
      `<input type="number"/>`,
    )

    Array.from(data).forEach(key => {
      input(setupInstance(), element, key)
    })

    expect(element).toHaveValue(expectedValue)
    expect(getUIValue(element)).toBe(expectedUiValue)
    expect(getEvents('input')).toHaveLength(expectedInputEvents)

    // TODO: implement ValidityState
    // expect(element.validity).toHaveProperty('badInput', expectedValue === null)
  },
)
