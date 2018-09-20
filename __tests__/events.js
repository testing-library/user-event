import React from 'react'
import { render } from 'react-testing-library'
import 'jest-dom/extend-expect'
import userEvent from '../src'

test('fireEvent.click simulates a user click', () => {
  const { getByTestId } = render(
    <React.Fragment>
      <input data-testid="A" />
      <input data-testid="B" />
    </React.Fragment>
  )

  const a = getByTestId('A')
  const b = getByTestId('B')

  expect(a).not.toHaveFocus()
  expect(b).not.toHaveFocus()

  userEvent.click(a)
  expect(a).toHaveFocus()
  expect(b).not.toHaveFocus()

  userEvent.click(b)
  expect(a).not.toHaveFocus()
  expect(a).not.toHaveFocus()
})
