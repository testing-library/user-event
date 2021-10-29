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
