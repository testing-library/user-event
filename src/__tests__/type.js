import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '../../src'

/* eslint-disable max-lines-per-function */

test.each(['input', 'textarea'])('should type text in <%s>', type => {
  const onChange = jest.fn()
  render(
    React.createElement(type, {
      'data-testid': 'input',
      onChange,
    }),
  )
  const text = 'Hello, world!'
  userEvent.type(screen.getByTestId('input'), text)
  expect(onChange).toHaveBeenCalledTimes(text.length)
  expect(screen.getByTestId('input')).toHaveProperty('value', text)
})

test('should append text one by one', () => {
  const onChange = jest.fn()
  render(<input data-testid="input" onChange={onChange} />)
  userEvent.type(screen.getByTestId('input'), 'hello')
  userEvent.type(screen.getByTestId('input'), ' world')
  expect(onChange).toHaveBeenCalledTimes('hello world'.length)
  expect(screen.getByTestId('input')).toHaveProperty('value', 'hello world')
})

test('should append text all at once', () => {
  const onChange = jest.fn()
  render(<input data-testid="input" onChange={onChange} />)
  userEvent.type(screen.getByTestId('input'), 'hello', {allAtOnce: true})
  userEvent.type(screen.getByTestId('input'), ' world', {allAtOnce: true})
  expect(onChange).toHaveBeenCalledTimes(2)
  expect(screen.getByTestId('input')).toHaveProperty('value', 'hello world')
})

test('should not type when event.preventDefault() is called', () => {
  const onChange = jest.fn()
  const onKeydown = jest
    .fn()
    .mockImplementation(event => event.preventDefault())
  render(
    <input data-testid="input" onKeyDown={onKeydown} onChange={onChange} />,
  )
  const text = 'Hello, world!'
  userEvent.type(screen.getByTestId('input'), text)
  expect(onKeydown).toHaveBeenCalledTimes(text.length)
  expect(onChange).toHaveBeenCalledTimes(0)
  expect(screen.getByTestId('input')).not.toHaveProperty('value', text)
})

test.each(['input', 'textarea'])(
  'should not type when <%s> is disabled',
  type => {
    const onChange = jest.fn()
    render(
      React.createElement(type, {
        'data-testid': 'input',
        onChange,
        disabled: true,
      }),
    )
    const text = 'Hello, world!'
    userEvent.type(screen.getByTestId('input'), text)
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByTestId('input')).toHaveProperty('value', '')
  },
)

test.each(['input', 'textarea'])(
  'should not type when <%s> is readOnly',
  type => {
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
    userEvent.type(screen.getByTestId('input'), text)
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
  type => {
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

    userEvent.type(inputEl, text)

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
  type => {
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

    userEvent.type(inputEl, text1)
    userEvent.type(inputEl, text2)

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

describe('special characters', () => {
  afterEach(jest.clearAllMocks)

  const onChange = jest.fn()
  const onKeyDown = jest.fn()
  const onKeyPress = jest.fn()
  const onKeyUp = jest.fn()

  it.each(['a{bc', 'a{bc}', 'a{backspacee}c'])(
    'properly parses %s',
    async text => {
      const {getByTestId} = render(
        React.createElement('input', {
          'data-testid': 'input',
        }),
      )

      const inputEl = getByTestId('input')

      await userEvent.type(inputEl, text)

      expect(inputEl).toHaveProperty('value', text)
    },
  )

  describe('{enter}', () => {
    describe('input', () => {
      it('should record key up/down/press events from {enter}', async () => {
        const {getByTestId} = render(
          React.createElement('input', {
            'data-testid': 'input',
            onChange,
            onKeyDown,
            onKeyPress,
            onKeyUp,
          }),
        )

        const inputEl = getByTestId('input')

        await userEvent.type(inputEl, 'abc{enter}')

        const expectedText = 'abc'

        expect(inputEl).toHaveProperty('value', expectedText)
        expect(onChange).toHaveBeenCalledTimes(3)
        expect(onKeyPress).toHaveBeenCalledTimes(4)
        expect(onKeyDown).toHaveBeenCalledTimes(4)
        expect(onKeyUp).toHaveBeenCalledTimes(4)
      })
    })

    describe('textarea', () => {
      it('should be able to type newlines with {enter}', async () => {
        const {getByTestId} = render(
          React.createElement('textarea', {
            'data-testid': 'input',
            onChange,
            onKeyDown,
            onKeyPress,
            onKeyUp,
          }),
        )

        const inputEl = getByTestId('input')

        await userEvent.type(inputEl, 'a{enter}{enter}b{enter}')

        const expectedText = 'a\n\nb\n'

        expect(inputEl).toHaveProperty('value', expectedText)
        expect(onChange).toHaveBeenCalledTimes(5)
        expect(onKeyPress).toHaveBeenCalledTimes(5)
        expect(onKeyDown).toHaveBeenCalledTimes(5)
        expect(onKeyUp).toHaveBeenCalledTimes(5)
      })
    })
  })

  describe('{esc}', () => {
    describe.each(['input', 'textarea'])('%s', elementType => {
      it('should record up/down/press events from {esc}', async () => {
        const {getByTestId} = render(
          React.createElement(elementType, {
            'data-testid': 'input',
            onChange,
            onKeyDown,
            onKeyPress,
            onKeyUp,
          }),
        )

        const inputEl = getByTestId('input')

        await userEvent.type(inputEl, 'a{esc}')

        const expectedText = 'a'

        expect(inputEl).toHaveProperty('value', expectedText)
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onKeyPress).toHaveBeenCalledTimes(1)
        expect(onKeyDown).toHaveBeenCalledTimes(2)
        expect(onKeyUp).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('{backspace}', () => {
    describe.each(['input', 'textarea'])('%s', elementType => {
      it.each([
        [
          'ab{backspace}c',
          'ac',
          {keyDown: 4, keyUp: 4, keyPress: 3, change: 4},
        ],
        [
          'a{backspace}{backspace}bc',
          'bc',
          {keyDown: 5, keyUp: 5, keyPress: 3, change: 4},
        ],
        [
          'a{{backspace}}',
          'a}',
          {keyDown: 4, keyUp: 4, keyPress: 3, change: 4},
        ],
      ])(
        'input `%s` should output `%s` and have the correct number of fired events',
        async (
          typeText,
          expectedText,
          {
            keyDown: numKeyDownEvents,
            keyUp: numKeyUpEvents,
            keyPress: numKeyPressEvents,
            change: numOnChangeEvents,
          },
        ) => {
          const {getByTestId} = render(
            React.createElement(elementType, {
              'data-testid': 'input',
              onChange,
              onKeyDown,
              onKeyPress,
              onKeyUp,
            }),
          )

          const inputEl = getByTestId('input')

          await userEvent.type(inputEl, typeText)

          expect(inputEl).toHaveProperty('value', expectedText)
          expect(onChange).toHaveBeenCalledTimes(numOnChangeEvents)
          expect(onKeyDown).toHaveBeenCalledTimes(numKeyDownEvents)
          expect(onKeyUp).toHaveBeenCalledTimes(numKeyUpEvents)
          expect(onKeyPress).toHaveBeenCalledTimes(numKeyPressEvents)
        },
      )
    })
  })

  describe('modifiers', () => {
    describe.each([
      ['shift', 'Shift', 'shiftKey'],
      ['ctrl', 'Control', 'ctrlKey'],
      ['alt', 'Alt', 'altKey'],
      ['meta', 'OS', 'metaKey'],
    ])('%s', (modifierText, modifierKey, modifierProperty) => {
      describe.each(['input', 'textarea'])('%s', elementType => {
        it('only adds modifier to following keystroke', async () => {
          const handler = jest.fn().mockImplementation(e => e.persist())

          const {getByTestId} = render(
            React.createElement(elementType, {
              'data-testid': 'input',
              onKeyDown: handler,
              onKeyPress: handler,
              onKeyUp: handler,
            }),
          )

          const inputEl = getByTestId('input')

          await userEvent.type(inputEl, `{${modifierText}}ab`)

          expect(inputEl).toHaveProperty('value', 'ab')

          expect(handler).toHaveBeenCalledWithEventAtIndex(0, {
            type: 'keydown',
            key: modifierKey,
            [modifierProperty]: false,
          })
          expect(handler).toHaveBeenCalledWithEventAtIndex(1, {
            type: 'keydown',
            key: 'a',
            [modifierProperty]: true,
          })
          expect(handler).toHaveBeenCalledWithEventAtIndex(2, {
            type: 'keypress',
            key: 'a',
            [modifierProperty]: true,
          })
          expect(handler).toHaveBeenCalledWithEventAtIndex(3, {
            type: 'keyup',
            key: 'a',
            [modifierProperty]: true,
          })
          expect(handler).toHaveBeenCalledWithEventAtIndex(4, {
            type: 'keydown',
            key: 'b',
            [modifierProperty]: true,
          })
          expect(handler).toHaveBeenCalledWithEventAtIndex(5, {
            type: 'keypress',
            key: 'b',
            [modifierProperty]: true,
          })
          expect(handler).toHaveBeenCalledWithEventAtIndex(6, {
            type: 'keyup',
            key: 'b',
            [modifierProperty]: true,
          })
          expect(handler).toHaveBeenCalledWithEventAtIndex(7, {
            type: 'keyup',
            key: modifierKey,
            [modifierProperty]: false,
          })
        })
      })
    })

    it('can handle multiple held modifiers', async () => {
      const handler = jest.fn().mockImplementation(e => e.persist())

      const {getByTestId} = render(
        React.createElement('input', {
          'data-testid': 'input',
          onKeyDown: handler,
          onKeyPress: handler,
          onKeyUp: handler,
        }),
      )

      const inputEl = getByTestId('input')

      await userEvent.type(inputEl, '{ctrl}{shift}ab')

      expect(inputEl).toHaveProperty('value', 'ab')

      expect(handler).toHaveBeenCalledTimes(10)

      expect(handler).toHaveBeenCalledWithEventAtIndex(0, {
        type: 'keydown',
        key: 'Control',
        ctrlKey: false,
        shiftKey: false,
      })
      expect(handler).toHaveBeenCalledWithEventAtIndex(1, {
        type: 'keydown',
        key: 'Shift',
        ctrlKey: true,
        shiftKey: false,
      })
      expect(handler).toHaveBeenCalledWithEventAtIndex(2, {
        type: 'keydown',
        key: 'a',
        ctrlKey: true,
        shiftKey: true,
      })
      expect(handler).toHaveBeenCalledWithEventAtIndex(3, {
        type: 'keypress',
        key: 'a',
        ctrlKey: true,
        shiftKey: true,
      })
      expect(handler).toHaveBeenCalledWithEventAtIndex(4, {
        type: 'keyup',
        key: 'a',
        ctrlKey: true,
        shiftKey: true,
      })
      expect(handler).toHaveBeenCalledWithEventAtIndex(5, {
        type: 'keydown',
        key: 'b',
        ctrlKey: true,
        shiftKey: true,
      })
      expect(handler).toHaveBeenCalledWithEventAtIndex(6, {
        type: 'keypress',
        key: 'b',
        ctrlKey: true,
        shiftKey: true,
      })
      expect(handler).toHaveBeenCalledWithEventAtIndex(7, {
        type: 'keyup',
        key: 'b',
        ctrlKey: true,
        shiftKey: true,
      })
      expect(handler).toHaveBeenCalledWithEventAtIndex(8, {
        type: 'keyup',
        key: 'Control',
        ctrlKey: false,
        shiftKey: true,
      })
      expect(handler).toHaveBeenCalledWithEventAtIndex(9, {
        type: 'keyup',
        key: 'Shift',
        ctrlKey: false,
        shiftKey: false,
      })
    })
  })
})
