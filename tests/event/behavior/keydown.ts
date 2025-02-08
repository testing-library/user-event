import cases from 'jest-in-case'
import {getUISelection} from '#src/document'
import {render} from '#testHelpers'
import {createConfig, createInstance} from '#src/setup/setup'

function setupInstance() {
  return createInstance(createConfig()).instance
}

describe('restrict certain keydown behavior to editable context', () => {
  ;['Backspace', 'Delete', 'End', 'Home', 'PageUp', 'PageDown'].forEach(key => {
    test(key, () => {
      const {element, getEvents} = render(`<div tabIndex="1"></div>`)

      setupInstance().dispatchUIEvent(element, 'keydown', {key})

      expect(getEvents().map(e => e.type)).toEqual(['keydown'])
    })
  })
})

cases(
  'alter input selection',
  ({html, selection, key, expectedSelection}) => {
    const {element} = render<HTMLInputElement>(html, {
      selection,
    })

    setupInstance().dispatchUIEvent(element, 'keydown', {
      key,
    })

    expect(getUISelection(element)).toEqual(
      expect.objectContaining(expectedSelection),
    )
  },
  {
    'collapse selection per [ArrowLeft]': {
      html: `<input value="foobar"/>`,
      selection: {anchorOffset: 2, focusOffset: 4},
      key: 'ArrowLeft',
      expectedSelection: {anchorOffset: 2, focusOffset: 2},
    },
    'collapse selection per [ArrowRight]': {
      html: `<input value="foobar"/>`,
      selection: {anchorOffset: 2, focusOffset: 4},
      key: 'ArrowRight',
      expectedSelection: {anchorOffset: 4, focusOffset: 4},
    },
    'move cursor per [ArrowLeft]': {
      html: `<input value="foobar"/>`,
      selection: {anchorOffset: 2, focusOffset: 2},
      key: 'ArrowLeft',
      expectedSelection: {anchorOffset: 1, focusOffset: 1},
    },
    'move cursor per [ArrowRight]': {
      html: `<input value="foobar"/>`,
      selection: {anchorOffset: 2, focusOffset: 2},
      key: 'ArrowRight',
      expectedSelection: {anchorOffset: 3, focusOffset: 3},
    },
    'set cursor per [Home]': {
      html: `<input value="foobar"/>`,
      selection: {anchorOffset: 2, focusOffset: 4},
      key: 'Home',
      expectedSelection: {anchorOffset: 0, focusOffset: 0},
    },
    'set cursor per [End]': {
      html: `<input value="foobar"/>`,
      selection: {anchorOffset: 2, focusOffset: 4},
      key: 'End',
      expectedSelection: {anchorOffset: 6, focusOffset: 6},
    },
    'set cursor per [PageUp]': {
      html: `<input value="foobar"/>`,
      selection: {anchorOffset: 2, focusOffset: 4},
      key: 'PageUp',
      expectedSelection: {anchorOffset: 0, focusOffset: 0},
    },
    'set cursor per [PageDown]': {
      html: `<input value="foobar"/>`,
      selection: {anchorOffset: 2, focusOffset: 4},
      key: 'PageDown',
      expectedSelection: {anchorOffset: 6, focusOffset: 6},
    },
  },
)

cases(
  'alter document selection',
  ({selection, key, expected}) => {
    const {
      elements: [, div],
      xpathNode,
    } = render(
      `<span>abc</span><div contenteditable><span>foo</span><span>bar</span></div><span>def</span>`,
      {selection},
    )

    expected.forEach(expectedSelection => {
      setupInstance().dispatchUIEvent(div, 'keydown', {key})

      const {focusNode, focusOffset} = document.getSelection() as Selection
      expect({focusNode, focusOffset}).toEqual({
        focusNode: xpathNode(expectedSelection.focusNode),
        focusOffset: expectedSelection.focusOffset,
      })
    })
  },
  {
    'collapse selection per [ArrowLeft]': {
      selection: {
        anchorNode: 'div/span[1]/text()',
        anchorOffset: 2,
        focusNode: 'div/span[2]/text()',
        focusOffset: 1,
      },
      key: 'ArrowLeft',
      expected: [{focusNode: 'div/span[1]/text()', focusOffset: 2}],
    },
    'collapse selection per [ArrowRight]': {
      selection: {
        anchorNode: 'div/span[1]/text()',
        anchorOffset: 2,
        focusNode: 'div/span[2]/text()',
        focusOffset: 1,
      },
      key: 'ArrowRight',
      expected: [{focusNode: 'div/span[2]/text()', focusOffset: 1}],
    },
    'move cursor per [ArrowLeft]': {
      selection: {
        focusNode: 'div/span[2]/text()',
        focusOffset: 1,
      },
      key: 'ArrowLeft',
      expected: [
        {focusNode: 'div/span[2]/text()', focusOffset: 0},
        {focusNode: 'div/span[1]/text()', focusOffset: 2},
        {focusNode: 'div/span[1]/text()', focusOffset: 1},
        {focusNode: 'div/span[1]/text()', focusOffset: 0},
        {focusNode: 'div/span[1]/text()', focusOffset: 0},
      ],
    },
    'move cursor per [ArrowRight]': {
      selection: {
        focusNode: 'div/span[1]/text()',
        focusOffset: 2,
      },
      key: 'ArrowRight',
      expected: [
        {focusNode: 'div/span[1]/text()', focusOffset: 3},
        {focusNode: 'div/span[2]/text()', focusOffset: 1},
        {focusNode: 'div/span[2]/text()', focusOffset: 2},
        {focusNode: 'div/span[2]/text()', focusOffset: 3},
        {focusNode: 'div/span[2]/text()', focusOffset: 3},
      ],
    },
    // TODO: implement [Home] and [End] on contenteditable with element children
    // 'set cursor per [Home]': {
    //   selection: {
    //     anchorNode: 'div/span[1]/text()',
    //     anchorOffset: 2,
    //     focusNode: 'div/span[2]/text()',
    //     focusOffset: 1,
    //   },
    //   key: 'Home',
    //   expected: [
    //     { focusNode: 'div/span[1]/text()', focusOffset: 0 },
    //   ],
    // },
    // 'set cursor per [End]': {
    //   selection: {
    //     anchorNode: 'div/span[1]/text()',
    //     anchorOffset: 2,
    //     focusNode: 'div/span[2]/text()',
    //     focusOffset: 1,
    //   },
    //   key: 'End',
    //   expected: [
    //     { focusNode: 'div/span[2]/text()', focusOffset: 3 },
    //   ],
    // },
  },
)

cases(
  'set cursor on contenteditable with single text node',
  ({key, expectedOffset}) => {
    const {element, xpathNode} = render(`<div contenteditable>foobar</div>`, {
      selection: {focusNode: 'div/text()', anchorOffset: 2, focusOffset: 4},
    })

    setupInstance().dispatchUIEvent(element, 'keydown', {key})

    const {focusNode, focusOffset} = document.getSelection() as Selection
    expect({focusNode, focusOffset}).toEqual({
      focusNode: xpathNode('div/text()'),
      focusOffset: expectedOffset,
    })
  },
  {
    Home: {
      key: 'Home',
      expectedOffset: 0,
    },
    End: {
      key: 'End',
      expectedOffset: 6,
    },
  },
)

test('select input per `Control+A`', async () => {
  const {element} = render<HTMLInputElement>(`<input value="foo bar baz"/>`, {
    selection: {focusOffset: 5},
  })

  const instance = setupInstance()
  instance.system.keyboard.modifiers.Control = true

  instance.dispatchUIEvent(element, 'keydown', {code: 'KeyA'})

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)
})

cases(
  'trigger deleteContent',
  ({key, inputType, expectedValue}) => {
    const {element, getEvents} = render(`<input value="abcd"/>`, {
      selection: {focusOffset: 2},
    })

    setupInstance().dispatchUIEvent(element, 'keydown', {key})

    expect(getEvents('input')[0]).toHaveProperty('inputType', inputType)
    expect(element).toHaveValue(expectedValue)
  },
  {
    Backspace: {
      key: 'Backspace',
      inputType: 'deleteContentBackward',
      expectedValue: 'acd',
    },
    Delete: {
      key: 'Delete',
      inputType: 'deleteContentForward',
      expectedValue: 'abd',
    },
  },
)

cases(
  'tab through elements',
  ({focus, shiftKey = false, expectedFocus, expectedSelection}) => {
    const {xpathNode} = render(
      `<input value="abc"/><input type="number" value="1e23"/><button/>`,
      {
        focus,
      },
    )

    const instance = setupInstance()
    instance.system.keyboard.modifiers.Shift = shiftKey

    instance.dispatchUIEvent(document.activeElement as Element, 'keydown', {
      key: 'Tab',
    })

    expect(xpathNode(expectedFocus)).toHaveFocus()
    if (expectedSelection) {
      expect(getUISelection(xpathNode(expectedFocus))).toEqual(
        expect.objectContaining(expectedSelection),
      )
    }
  },
  {
    'tab to input': {
      focus: '//body',
      expectedFocus: 'input[1]',
      expectedSelection: {startOffset: 0, endOffset: 3},
    },
    'tab to number input': {
      focus: 'input[1]',
      expectedFocus: 'input[2]',
      expectedSelection: {startOffset: 0, endOffset: 4},
    },
    'tab forward to body': {
      focus: 'button',
      expectedFocus: '//body',
    },
    'tab backward to body': {
      focus: '*[1]',
      shiftKey: true,
      expectedFocus: '//body',
    },
    'tab backward around the corner': {
      focus: '//body',
      shiftKey: true,
      expectedFocus: 'button',
    },
  },
)

cases(
  'walk through radio group per arrow keys',
  ({focus, key, expectedTarget}) => {
    const {getEvents, eventWasFired, xpathNode} = render(
      `
      <input type="radio" name="group" value="a"/>
      <fieldset disabled>
        <input type="radio" name="group" value="b"/>
      </fieldset>
      <input type="radio" name="solo"/>
      <input type="radio" value="nameless1"/>
      <input type="radio" name="" value="nameless2"/>
      <input type="radio" name="group" value="c" disabled/>
      <input type="radio" name="group" value="d"/>
      <input type="radio" name="group" value="f" aria-disabled />
      <input type="radio" name="group" value="e" />
      <input type="radio" name="foo"/>
      <input type="text" name="group"/>
    `,
      {focus},
    )

    const active = document.activeElement as Element
    setupInstance().dispatchUIEvent(active, 'keydown', {key})

    if (expectedTarget) {
      const target = xpathNode(expectedTarget)
      expect(getEvents('click')[0]).toHaveProperty('target', target)
      expect(getEvents('input')[0]).toHaveProperty('target', target)
      expect(target).toHaveFocus()
      expect(target).toBeChecked()
    } else {
      expect(eventWasFired('click')).toBe(false)
      expect(eventWasFired('input')).toBe(false)
      expect(active).toHaveFocus()
    }
  },
  {
    'per ArrowDown': {
      focus: '//input[@value="a"]',
      key: 'ArrowDown',
      expectedTarget: '//input[@value="d"]',
    },
    'per ArrowLeft': {
      focus: '//input[@value="d"]',
      key: 'ArrowLeft',
      expectedTarget: '//input[@value="a"]',
    },
    'per ArrowRight': {
      focus: '//input[@value="a"]',
      key: 'ArrowRight',
      expectedTarget: '//input[@value="d"]',
    },
    'per ArrowUp': {
      focus: '//input[@value="d"]',
      key: 'ArrowUp',
      expectedTarget: '//input[@value="a"]',
    },
    'forward around the corner': {
      focus: '//input[@value="e"]',
      key: 'ArrowRight',
      expectedTarget: '//input[@value="a"]',
    },
    'backward around the corner': {
      focus: '//input[@value="a"]',
      key: 'ArrowUp',
      expectedTarget: '//input[@value="e"]',
    },
    'do nothing on single radio': {
      focus: '//input[@name="solo"]',
      key: 'ArrowRight',
    },
    'on radios without name': {
      focus: '//input[@value="nameless1"]',
      key: 'ArrowRight',
      expectedTarget: '//input[@value="nameless2"]',
    },
    'on radios with aria-disabled': {
      focus: '//input[@value="d"]',
      key: 'ArrowDown',
      expectedTarget: '//input[@value="f"]',
    },
  },
)

test("increment number input's value when pressing the arrow up key", () => {
  const {element} = render<HTMLInputElement>(`<input value="1" type="number"/>`)

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowUp'})

  expect(element).toHaveValue(2)
})

test("do not increment number input's value when pressing the arrow up key and it would go above the max value", () => {
  const {element} = render<HTMLInputElement>(
    `<input value="1" type="number" max="1"/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowUp'})

  expect(element).toHaveValue(1)
})

test("decrement number input's value when pressing the arrow down key", () => {
  const {element} = render<HTMLInputElement>(`<input value="1" type="number"/>`)

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowDown'})

  expect(element).toHaveValue(0)
})

test("do not decrement number input's value when pressing the arrow down key and it would go below the min value", () => {
  const {element} = render<HTMLInputElement>(
    `<input value="1" type="number" min="1"/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowDown'})

  expect(element).toHaveValue(1)
})

test("increments number input's value by the defined steps when pressing the arrow up key", () => {
  const {element} = render<HTMLInputElement>(
    `<input value="10" type="number" step="10"/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowUp'})

  expect(element).toHaveValue(20)
})

test("decrements number input's value by the defined steps when pressing the arrow down key", () => {
  const {element} = render<HTMLInputElement>(
    `<input value="10" type="number" step="10"/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowDown'})

  expect(element).toHaveValue(0)
})

test('decrements only to the min value when pressing the arrow down key and steps are too large', async () => {
  const {element} = render<HTMLInputElement>(
    `<input value="5" type="number" min="0" step="10"/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowDown'})

  expect(element).toHaveValue(0)
})

test('increments only to the max value when pressing the arrow up key and steps are too large', async () => {
  const {element} = render<HTMLInputElement>(
    `<input value="5" type="number" max="10" step="10"/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowUp'})

  expect(element).toHaveValue(10)
})

test("does not increment number input's value when pressing the arrow up key and the input is disabled", () => {
  const {element} = render<HTMLInputElement>(
    `<input value="1" type="number" disabled/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowUp'})

  expect(element).toHaveValue(1)
})

test("does not decrement number input's value when pressing the arrow down key and the input is disabled", () => {
  const {element} = render<HTMLInputElement>(
    `<input value="1" type="number" disabled/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowDown'})

  expect(element).toHaveValue(1)
})

test("does not increment number input's value when pressing the arrow up key and the input is readonly", () => {
  const {element} = render<HTMLInputElement>(
    `<input value="1" type="number" readonly/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowUp'})

  expect(element).toHaveValue(1)
})

test("does not decrement number input's value when pressing the arrow down key and the input is readonly", () => {
  const {element} = render<HTMLInputElement>(
    `<input value="1" type="number" readonly/>`,
  )

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowDown'})

  expect(element).toHaveValue(1)
})

test('decrements to a negative value when pressing the arrow down key', () => {
  const {element} = render<HTMLInputElement>(`<input value="0" type="number"/>`)

  const instance = setupInstance()

  instance.dispatchUIEvent(element, 'keydown', {key: 'ArrowDown'})

  expect(element).toHaveValue(-1)
})
