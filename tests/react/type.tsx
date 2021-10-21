import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '#src'

test('trigger onChange SyntheticEvent on input', () => {
  const inputHandler = jest.fn()
  const changeHandler = jest.fn()

  render(<input onInput={inputHandler} onChange={changeHandler} />)

  userEvent.type(screen.getByRole('textbox'), 'abcdef')

  expect(inputHandler).toHaveBeenCalledTimes(6)
  expect(changeHandler).toHaveBeenCalledTimes(6)
})
