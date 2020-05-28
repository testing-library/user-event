import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '../../src'

test('should handle ArrowDown', () => {
  const onKeyDown = jest.fn()
  const onKeyUp = jest.fn()

  render(<div data-testid="element" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />)

  const div = screen.getByTestId('element')

  userEvent.arrowPress(div, 'ArrowDown')
  expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({}))
  expect(onKeyUp).toHaveBeenCalledWith(expect.objectContaining({}))
})

test('should handle ArrowLeft', () => {
  const onKeyDown = jest.fn()
  const onKeyUp = jest.fn()

  render(<div data-testid="element" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />)

  const div = screen.getByTestId('element')

  userEvent.arrowPress(div, 'ArrowLeft')
  expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({}))
  expect(onKeyUp).toHaveBeenCalledWith(expect.objectContaining({}))
})

test('should handle ArrowRight', () => {
  const onKeyDown = jest.fn()
  const onKeyUp = jest.fn()

  render(<div data-testid="element" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />)

  const div = screen.getByTestId('element')

  userEvent.arrowPress(div, 'ArrowRight')
  expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({}))
  expect(onKeyUp).toHaveBeenCalledWith(expect.objectContaining({}))
})

test('should handle ArrowUp', () => {
  const onKeyDown = jest.fn()
  const onKeyUp = jest.fn()

  render(<div data-testid="element" onKeyDown={onKeyDown} onKeyUp={onKeyUp} />)

  const div = screen.getByTestId('element')

  userEvent.arrowPress(div, 'ArrowUp')
  expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({}))
  expect(onKeyUp).toHaveBeenCalledWith(expect.objectContaining({}))
})
