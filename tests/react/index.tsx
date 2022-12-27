import React, {useLayoutEffect, useRef, useState} from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '#src'
import {getUISelection, getUIValue} from '#src/document'
import {addListeners} from '#testHelpers'

// Run twice to verify we handle this correctly no matter
// if React applies its magic before or after our document preparation.
test.each([0, 1])('maintain cursor position on controlled input', async () => {
  function Input({initialValue}: {initialValue: string}) {
    const [val, setVal] = useState(initialValue)

    return <input value={val} onChange={e => setVal(e.target.value)} />
  }

  render(<Input initialValue="acd" />)
  screen.getByRole('textbox').focus()
  screen.getByRole<HTMLInputElement>('textbox').setSelectionRange(1, 1)
  await userEvent.keyboard('b')

  expect(screen.getByRole('textbox')).toHaveValue('abcd')
  expect(screen.getByRole('textbox')).toHaveProperty('selectionStart', 2)
  expect(screen.getByRole('textbox')).toHaveProperty('selectionEnd', 2)
})

test('trigger Synthetic `keypress` event for printable characters', async () => {
  const onKeyPress = mocks.fn()
  render(<input onKeyPress={onKeyPress} />)
  const user = userEvent.setup()
  screen.getByRole('textbox').focus()

  await user.keyboard('a')
  expect(onKeyPress).toHaveBeenCalledTimes(1)
  expect(onKeyPress.mock.calls[0][0]).toHaveProperty('charCode', 97)

  await user.keyboard('[Enter]')
  expect(onKeyPress).toHaveBeenCalledTimes(2)
  expect(onKeyPress.mock.calls[1][0]).toHaveProperty('charCode', 13)
})

test.each(['1.5', '1e5'])(
  'insert number with invalid intermediate values into controlled `<input type="number"/>`: %s',
  async input => {
    function Input() {
      const [val, setVal] = useState('')

      return (
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
        />
      )
    }
    render(<Input />)
    const user = userEvent.setup()
    screen.getByRole('spinbutton').focus()

    await user.keyboard(input)
    expect(getUIValue(screen.getByRole('spinbutton'))).toBe(input)
    expect(screen.getByRole('spinbutton')).toHaveValue(Number(input))
  },
)

test('detect value and selection change', async () => {
  function Input() {
    const el = useRef<HTMLInputElement>(null)
    const [val, setVal] = useState('')

    useLayoutEffect(() => {
      if (val === 'ab') {
        el.current?.setSelectionRange(1, 1)
      }
    })

    return (
      <input
        ref={el}
        value={val}
        onChange={e => {
          if (e.target.value === 'acb') {
            e.target.value = 'def'
          }
          setVal(e.target.value)
        }}
      />
    )
  }
  render(<Input />)
  const user = userEvent.setup()
  const element = screen.getByRole<HTMLInputElement>('textbox')
  element.focus()

  await user.keyboard('ab')
  expect(getUIValue(element)).toBe('ab')
  expect(element).toHaveValue('ab')
  expect(getUISelection(element)).toHaveProperty('focusOffset', 1)

  await user.keyboard('c')
  expect(getUIValue(element)).toBe('def')
  expect(element).toHaveValue('def')

  await user.keyboard('g')
  expect(getUIValue(element)).toBe('defg')
  expect(element).toHaveValue('defg')
})

test('trigger onChange SyntheticEvent on input', async () => {
  const inputHandler = mocks.fn()
  const changeHandler = mocks.fn()

  render(<input onInput={inputHandler} onChange={changeHandler} />)
  const user = userEvent.setup()

  await user.type(screen.getByRole('textbox'), 'abcdef')

  expect(inputHandler).toHaveBeenCalledTimes(6)
  expect(changeHandler).toHaveBeenCalledTimes(6)
})

describe('typing in a formatted input', () => {
  function DollarInput({initialValue = ''}) {
    const [val, setVal] = useState(initialValue)
    return (
      <input
        value={val}
        onChange={e => {
          const newValue = e.target.value
          const withoutDollar = newValue.replace(/\$/g, '')
          const num = Number(withoutDollar)
          if (!Number.isNaN(num)) {
            setVal(`$${withoutDollar}`)
          }
        }}
      />
    )
  }

  function setupDollarInput({initialValue = ''} = {}) {
    const {container} = render(<DollarInput initialValue={initialValue} />)
    const element = container.querySelector('input') as HTMLInputElement

    return {
      element,
      user: userEvent.setup(),
      ...addListeners(element),
    }
  }

  test('typing in empty formatted input', async () => {
    const {element, user} = setupDollarInput()

    await user.type(element, '23')

    expect(element).toHaveValue('$23')
  })

  test('typing in the middle of a formatted input', async () => {
    const {element, user} = setupDollarInput({
      initialValue: '$23',
    })

    await user.type(element, '1', {initialSelectionStart: 2})

    expect(element).toHaveValue('$213')
    expect(element).toHaveProperty('selectionStart', 3)
    expect(element).toHaveProperty('selectionEnd', 3)
  })

  test('ignored {backspace} in formatted input', async () => {
    const {element, user} = setupDollarInput({
      initialValue: '$23',
    })

    await user.type(element, '{backspace}', {
      initialSelectionStart: 1,
      initialSelectionEnd: 1,
    })
    // this is the same behavior in the browser.
    // in our case, when you try to backspace the "$", our event handler
    // will ignore that change and React resets the value to what it was
    // before. When the value is set programmatically to something different
    // from what was expected based on the input event, the browser sets
    // the selection start and end to the end of the input
    expect(element.selectionStart).toBe(3)
    expect(element.selectionEnd).toBe(3)

    await user.type(element, '4')

    expect(element).toHaveValue('$234')
  })
})

test('change select with delayed state update', async () => {
  function Select() {
    const [selected, setSelected] = useState<string[]>([])

    return (
      <select
        multiple
        value={selected}
        onChange={e => {
          const values = Array.from(e.target.selectedOptions).map(o => o.value)
          setTimeout(() => setSelected(values))
        }}
      >
        <option>Chrome</option>
        <option>Firefox</option>
        <option>Opera</option>
      </select>
    )
  }

  render(<Select />)

  await userEvent.selectOptions(
    screen.getByRole('listbox'),
    ['Chrome', 'Firefox'],
    {delay: 10},
  )

  await waitFor(() => {
    expect(screen.getByRole('listbox')).toHaveValue(['Chrome', 'Firefox'])
  })
})
