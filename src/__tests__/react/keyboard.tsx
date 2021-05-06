import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from 'index'

test('maintain cursor position on controlled input', () => {
    function Input({initialValue}: {initialValue: string}) {
        const [val, setVal] = useState(initialValue)

        return <input value={val} onChange={e => setVal(e.target.value)}/>
    }

    render(<Input initialValue="acd"/>)

    ;screen.getByRole('textbox').focus()
    ;(screen.getByRole('textbox') as HTMLInputElement).setSelectionRange(1,1)
    userEvent.keyboard('b')

    expect(screen.getByRole('textbox')).toHaveValue('abcd')
    expect(screen.getByRole('textbox')).toHaveProperty('selectionStart', 2)
    expect(screen.getByRole('textbox')).toHaveProperty('selectionEnd', 2)
})
