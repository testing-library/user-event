import React, {Fragment} from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '..'
import {setup} from './helpers/utils'

it('types text in input', async () => {
  const {element, getEventCalls} = setup(<input />)
  await userEvent.type(element, 'Sup')
  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: S (83)
    keypress: S (83)
    input: "{CURSOR}" -> "S"
    keyup: S (83)
    keydown: u (117)
    keypress: u (117)
    input: "S{CURSOR}" -> "Su"
    keyup: u (117)
    keydown: p (112)
    keypress: p (112)
    input: "Su{CURSOR}" -> "Sup"
    keyup: p (112)
  `)
})

it('types text in textarea', async () => {
  const {element, getEventCalls} = setup(<textarea />)
  await userEvent.type(element, 'Sup')
  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: S (83)
    keypress: S (83)
    input: "{CURSOR}" -> "S"
    keyup: S (83)
    keydown: u (117)
    keypress: u (117)
    input: "S{CURSOR}" -> "Su"
    keyup: u (117)
    keydown: p (112)
    keypress: p (112)
    input: "Su{CURSOR}" -> "Sup"
    keyup: p (112)
  `)
})

test('should append text all at once', async () => {
  const {element, getEventCalls} = setup(<input />)
  await userEvent.type(element, 'Sup', {allAtOnce: true})
  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    input: "{CURSOR}" -> "Sup"
  `)
})

test('does not fire input event when keypress calls prevent default', async () => {
  const {element, getEventCalls} = setup(
    <input onKeyPress={e => e.preventDefault()} />,
  )
  await userEvent.type(element, 'a')
  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: a (97)
    keypress: a (97)
    keyup: a (97)
  `)
})

test('does not fire keypress or input events when keydown calls prevent default', async () => {
  const {element, getEventCalls} = setup(
    <input onKeyDown={e => e.preventDefault()} />,
  )
  await userEvent.type(element, 'a')
  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: a (97)
    keyup: a (97)
  `)
})

// TODO: Let's migrate these tests to use the setup util
test('should not type when event.preventDefault() is called', async () => {
  const onChange = jest.fn()
  const onKeydown = jest
    .fn()
    .mockImplementation(event => event.preventDefault())
  render(
    <input data-testid="input" onKeyDown={onKeydown} onChange={onChange} />,
  )
  const text = 'Hello, world!'
  await userEvent.type(screen.getByTestId('input'), text)
  expect(onKeydown).toHaveBeenCalledTimes(text.length)
  expect(onChange).toHaveBeenCalledTimes(0)
  expect(screen.getByTestId('input')).not.toHaveProperty('value', text)
})

test.each(['input', 'textarea'])(
  'should not type when <%s> is disabled',
  async type => {
    const onChange = jest.fn()
    render(
      React.createElement(type, {
        'data-testid': 'input',
        onChange,
        disabled: true,
      }),
    )
    const text = 'Hello, world!'
    await userEvent.type(screen.getByTestId('input'), text)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('input')).toHaveProperty('value', '')
  },
)

test.each(['input', 'textarea'])(
  'should not type when <%s> is readOnly',
  async type => {
    const onChange = jest.fn()
    const onKeyDown = jest.fn()
    const onKeyPress = jest.fn()
    const onKeyUp = jest.fn()
    render(
      React.createElement(type, {
        'data-testid': 'input',
        onChange,
        onKeyDown,
        onKeyPress,
        onKeyUp,
        readOnly: true,
      }),
    )
    const text = 'Hello, world!'
    await userEvent.type(screen.getByTestId('input'), text)
    expect(onKeyDown).toHaveBeenCalledTimes(text.length)
    expect(onKeyPress).toHaveBeenCalledTimes(text.length)
    expect(onKeyUp).toHaveBeenCalledTimes(text.length)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('input')).toHaveProperty('value', '')
  },
)

test('does not type when readOnly even with allAtOnce', () => {
  const handleChange = jest.fn()
  render(<input data-testid="input" readOnly onChange={handleChange} />)
  userEvent.type(screen.getByTestId('input'), 'hi', {allAtOnce: true})
  expect(handleChange).not.toHaveBeenCalled()
})

test('does not type when disabled even with allAtOnce', () => {
  const handleChange = jest.fn()
  render(<input data-testid="input" disabled onChange={handleChange} />)
  userEvent.type(screen.getByTestId('input'), 'hi', {allAtOnce: true})
  expect(handleChange).not.toHaveBeenCalled()
})

test('should delay the typing when opts.delay is not 0', async () => {
  const inputValues = [{timestamp: Date.now(), value: ''}]
  const onInput = jest.fn(event => {
    inputValues.push({timestamp: Date.now(), value: event.target.value})
  })

  render(<input data-testid="input" onInput={onInput} />)

  const text = 'Hello, world!'
  const delay = 10
  await userEvent.type(screen.getByTestId('input'), text, {
    delay,
  })

  expect(onInput).toHaveBeenCalledTimes(text.length)
  for (let index = 1; index < inputValues.length; index++) {
    const {timestamp, value} = inputValues[index]
    expect(timestamp - inputValues[index - 1].timestamp).toBeGreaterThanOrEqual(
      delay,
    )
    expect(value).toBe(text.slice(0, index))
  }
})

test.each(['input', 'textarea'])(
  'should type text in <%s> all at once',
  type => {
    const onChange = jest.fn()
    render(
      React.createElement(type, {
        'data-testid': 'input',
        onChange,
      }),
    )
    const text = 'Hello, world!'
    userEvent.type(screen.getByTestId('input'), text, {
      allAtOnce: true,
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('input')).toHaveProperty('value', text)
  },
)

test.each(['input', 'textarea'])(
  'should enter text in <%s> up to maxLength if provided',
  async type => {
    const onChange = jest.fn()
    const onKeyDown = jest.fn()
    const onKeyPress = jest.fn()
    const onKeyUp = jest.fn()
    const maxLength = 10

    render(
      React.createElement(type, {
        'data-testid': 'input',
        onChange,
        onKeyDown,
        onKeyPress,
        onKeyUp,
        maxLength,
      }),
    )

    const text = 'superlongtext'
    const slicedText = text.slice(0, maxLength)

    const inputEl = screen.getByTestId('input')

    await userEvent.type(inputEl, text)

    expect(inputEl).toHaveProperty('value', slicedText)
    expect(onChange).toHaveBeenCalledTimes(slicedText.length)
    expect(onKeyPress).toHaveBeenCalledTimes(text.length)
    expect(onKeyDown).toHaveBeenCalledTimes(text.length)
    expect(onKeyUp).toHaveBeenCalledTimes(text.length)

    inputEl.value = ''
    onChange.mockClear()
    onKeyPress.mockClear()
    onKeyDown.mockClear()
    onKeyUp.mockClear()

    userEvent.type(inputEl, text, {
      allAtOnce: true,
    })

    expect(inputEl).toHaveProperty('value', slicedText)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onKeyPress).not.toHaveBeenCalled()
    expect(onKeyDown).not.toHaveBeenCalled()
    expect(onKeyUp).not.toHaveBeenCalled()
  },
)

test.each(['input', 'textarea'])(
  'should append text in <%s> up to maxLength if provided',
  async type => {
    const onChange = jest.fn()
    const onKeyDown = jest.fn()
    const onKeyPress = jest.fn()
    const onKeyUp = jest.fn()
    const maxLength = 10

    render(
      React.createElement(type, {
        'data-testid': 'input',
        onChange,
        onKeyDown,
        onKeyPress,
        onKeyUp,
        maxLength,
      }),
    )

    const text1 = 'superlong'
    const text2 = 'text'
    const text = text1 + text2
    const slicedText = text.slice(0, maxLength)

    const inputEl = screen.getByTestId('input')

    await userEvent.type(inputEl, text1)
    await userEvent.type(inputEl, text2)

    expect(inputEl).toHaveProperty('value', slicedText)
    expect(onChange).toHaveBeenCalledTimes(slicedText.length)
    expect(onKeyPress).toHaveBeenCalledTimes(text.length)
    expect(onKeyDown).toHaveBeenCalledTimes(text.length)
    expect(onKeyUp).toHaveBeenCalledTimes(text.length)

    inputEl.value = ''
    onChange.mockClear()
    onKeyPress.mockClear()
    onKeyDown.mockClear()
    onKeyUp.mockClear()

    userEvent.type(inputEl, text, {
      allAtOnce: true,
    })

    expect(inputEl).toHaveProperty('value', slicedText)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onKeyPress).not.toHaveBeenCalled()
    expect(onKeyDown).not.toHaveBeenCalled()
    expect(onKeyUp).not.toHaveBeenCalled()
  },
)

test('should fire events on the currently focused element', async () => {
  const changeFocusLimit = 7
  const onKeyDown = jest.fn(event => {
    if (event.target.value.length === changeFocusLimit) {
      screen.getByTestId('input2').focus()
    }
  })

  render(
    <Fragment>
      <input data-testid="input1" onKeyDown={onKeyDown} />
      <input data-testid="input2" />
    </Fragment>,
  )

  const text = 'Hello, world!'

  const input1 = screen.getByTestId('input1')
  const input2 = screen.getByTestId('input2')

  await userEvent.type(input1, text)

  expect(input1).toHaveValue(text.slice(0, changeFocusLimit))
  expect(input2).toHaveValue(text.slice(changeFocusLimit))
  expect(input2).toHaveFocus()
})

test('should enter text up to maxLength of the current element if provided', async () => {
  const changeFocusLimit = 7
  const input2MaxLength = 2

  const onKeyDown = jest.fn(event => {
    if (event.target.value.length === changeFocusLimit) {
      screen.getByTestId('input2').focus()
    }
  })

  render(
    <>
      <input data-testid="input" onKeyDown={onKeyDown} />
      <input data-testid="input2" maxLength={input2MaxLength} />
    </>,
  )

  const text = 'Hello, world!'
  const input2ExpectedValue = text.slice(
    changeFocusLimit,
    changeFocusLimit + input2MaxLength,
  )

  const input1 = screen.getByTestId('input')
  const input2 = screen.getByTestId('input2')

  await userEvent.type(input1, text)

  expect(input1).toHaveValue(text.slice(0, changeFocusLimit))
  expect(input2).toHaveValue(input2ExpectedValue)
  expect(input2).toHaveFocus()
})

test('should replace selected text one by one', async () => {
  const onChange = jest.fn()
  const {
    container: {firstChild: input},
  } = render(<input defaultValue="hello world" onChange={onChange} />)
  const selectionStart = 'hello world'.search('world')
  const selectionEnd = selectionStart + 'world'.length
  input.setSelectionRange(selectionStart, selectionEnd)
  await userEvent.type(input, 'friend')
  expect(onChange).toHaveBeenCalledTimes('friend'.length)
  expect(input).toHaveValue('hello friend')
})

test('should replace selected text one by one up to maxLength if provided', async () => {
  const maxLength = 10
  const onChange = jest.fn()
  const {
    container: {firstChild: input},
  } = render(
    <input
      defaultValue="hello world"
      onChange={onChange}
      maxLength={maxLength}
    />,
  )
  const selectionStart = 'hello world'.search('world')
  const selectionEnd = selectionStart + 'world'.length
  input.setSelectionRange(selectionStart, selectionEnd)
  const resultIfUnlimited = 'hello friend'
  const slicedText = resultIfUnlimited.slice(0, maxLength)
  await userEvent.type(input, 'friend')
  const truncatedCharCount = resultIfUnlimited.length - slicedText.length
  expect(onChange).toHaveBeenCalledTimes('friend'.length - truncatedCharCount)
  expect(input).toHaveValue(slicedText)
})

test('should replace selected text all at once', async () => {
  const onChange = jest.fn()
  const {
    container: {firstChild: input},
  } = render(<input defaultValue="hello world" onChange={onChange} />)
  const selectionStart = 'hello world'.search('world')
  const selectionEnd = selectionStart + 'world'.length
  input.setSelectionRange(selectionStart, selectionEnd)
  await userEvent.type(input, 'friend', {allAtOnce: true})
  expect(onChange).toHaveBeenCalledTimes(1)
  expect(input).toHaveValue('hello friend')
})

test('does not continue firing events when disabled during typing', async () => {
  function TestComp() {
    const [disabled, setDisabled] = React.useState(false)
    return <input disabled={disabled} onChange={() => setDisabled(true)} />
  }
  const {
    container: {firstChild: input},
  } = render(<TestComp />)
  await userEvent.type(input, 'hi there')
  expect(input).toHaveValue('h')
})

function DollarInput({initialValue = ''}) {
  const [value, setValue] = React.useState(initialValue)
  function handleChange(event) {
    const val = event.target.value
    const withoutDollar = val.replace(/\$/g, '')
    const num = Number(withoutDollar)
    if (Number.isNaN(num)) return
    setValue(`$${withoutDollar}`)
  }
  return <input value={value} type="text" onChange={handleChange} />
}

test('typing into a controlled input works', async () => {
  const {element, getEventCalls} = setup(<DollarInput />)
  await userEvent.type(element, '23')
  expect(element.value).toBe('$23')
  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: 2 (50)
    keypress: 2 (50)
    input: "{CURSOR}" -> "2"
    keyup: 2 (50)
    keydown: 3 (51)
    keypress: 3 (51)
    input: "$2{CURSOR}" -> "$23"
    keyup: 3 (51)
  `)
})

test('typing in the middle of a controlled input works', async () => {
  const {element, getEventCalls} = setup(<DollarInput initialValue="$23" />)
  element.setSelectionRange(2, 2)

  await userEvent.type(element, '1')

  expect(element.value).toBe('$213')
  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: 1 (49)
    keypress: 1 (49)
    input: "$2{CURSOR}3" -> "$213"
    keyup: 1 (49)
  `)
})

test('ignored {backspace} in controlled input', async () => {
  const {element, getEventCalls} = setup(<DollarInput initialValue="$23" />)
  element.setSelectionRange(1, 1)

  await userEvent.type(element, '{backspace}')
  // this is the same behavior in the browser.
  // in our case, when you try to backspace the "$", our event handler
  // will ignore that change and React resets the value to what it was
  // before. When the value is set programmatically to something different
  // from what was expected based on the input event, the browser sets
  // the selection start and end to the end of the input
  expect(element.selectionStart).toBe(element.value.length)
  expect(element.selectionEnd).toBe(element.value.length)
  await userEvent.type(element, '4')

  expect(element.value).toBe('$234')
  // the backslash in the inline snapshot is to escape the $ before {CURSOR}
  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Backspace (8)
    input: "\${CURSOR}23" -> "23"
    keyup: Backspace (8)
    keydown: 4 (52)
    keypress: 4 (52)
    input: "$23{CURSOR}" -> "$234"
    keyup: 4 (52)
  `)
})

test.each([
  ['email', String],
  ['password', String],
  ['number', Number],
  ['text', String],
])(`typing in an input of type="%s" works`, async (inputType, resultType) => {
  const onChange = jest.fn()
  const {
    container: {firstChild: input},
  } = render(
    <input type={inputType} onChange={onChange} aria-label="Test input" />,
  )

  await userEvent.type(input, '5550690')
  expect(onChange).toHaveBeenCalledTimes(7)
  expect(input).toHaveValue(resultType(5550690))
})
