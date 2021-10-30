import React, {useState} from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '#src'

// Run twice to verify we handle this correctly no matter
// if React applies its magic before or after our document preparation.
test.each([0, 1])('maintain cursor position on controlled input', () => {
  function Input({initialValue}: {initialValue: string}) {
    const [val, setVal] = useState(initialValue)

    return <input value={val} onChange={e => setVal(e.target.value)} />
  }

  render(<Input initialValue="acd" />)
  screen.getByRole('textbox').focus()
  ;(screen.getByRole('textbox') as HTMLInputElement).setSelectionRange(1, 1)
  userEvent.keyboard('b')

  expect(screen.getByRole('textbox')).toHaveValue('abcd')
  expect(screen.getByRole('textbox')).toHaveProperty('selectionStart', 2)
  expect(screen.getByRole('textbox')).toHaveProperty('selectionEnd', 2)
})

test('trigger Synthetic `keypress` event for printable characters', () => {
  const onKeyPress = jest.fn<unknown, [React.KeyboardEvent]>()
  render(<input onKeyPress={onKeyPress} />)
  screen.getByRole('textbox').focus()

  userEvent.keyboard('a')
  expect(onKeyPress).toHaveBeenCalledTimes(1)
  expect(onKeyPress.mock.calls[0][0]).toHaveProperty('charCode', 97)

  userEvent.keyboard('[Enter]')
  expect(onKeyPress).toHaveBeenCalledTimes(2)
  expect(onKeyPress.mock.calls[1][0]).toHaveProperty('charCode', 13)
})
