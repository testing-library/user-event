import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '../../src'

test.each(['input', 'textarea'])('should clear text in <%s>', type => {
  const onChange = jest.fn()
  render(
    React.createElement(type, {
      'data-testid': 'input',
      onChange,
      value: 'Hello, world!',
    }),
  )

  const input = screen.getByTestId('input')
  userEvent.clear(input)
  expect(input.value).toBe('')
})

test.each(['input', 'textarea'])(
  'should not clear when <%s> is disabled',
  type => {
    const text = 'Hello, world!'
    const onChange = jest.fn()
    render(
      React.createElement(type, {
        'data-testid': 'input',
        onChange,
        value: text,
        disabled: true,
      }),
    )

    const input = screen.getByTestId('input')
    userEvent.clear(input)
    expect(input).toHaveProperty('value', text)
  },
)

test.each(['input', 'textarea'])(
  'should not clear when <%s> is readOnly',
  type => {
    const onChange = jest.fn()
    const onKeyDown = jest.fn()
    const onKeyUp = jest.fn()

    const text = 'Hello, world!'
    render(
      React.createElement(type, {
        'data-testid': 'input',
        onChange,
        onKeyDown,
        onKeyUp,
        value: text,
        readOnly: true,
      }),
    )

    const input = screen.getByTestId('input')
    userEvent.clear(input)
    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onKeyUp).toHaveBeenCalledTimes(1)
    expect(input).toHaveProperty('value', text)
  },
)
;['email', 'password', 'number', 'text'].forEach(type => {
  test.each(['input', 'textarea'])(
    `should clear when <%s> is of type="${type}"`,
    inputType => {
      const value = '12345'
      const placeholder = 'Enter password'

      const element = React.createElement(inputType, {
        value,
        placeholder,
        type,
        onChange: jest.fn(),
      })

      render(element)

      const input = screen.getByPlaceholderText(placeholder)
      expect(input.value).toBe(value)
      userEvent.clear(input)
      expect(input.value).toBe('')
    },
  )
})
