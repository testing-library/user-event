import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '..'
import {setup} from './helpers/utils'

test('hover', () => {
  const {element, getEventCalls} = setup(<button />)

  userEvent.hover(element)
  expect(getEventCalls()).toMatchInlineSnapshot(`
    mouseenter: Left (0)
    mouseover: Left (0)
    mousemove: Left (0)
  `)
})

test('hover should fire events', () => {
  const handler = jest.fn()
  render(
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <button
      data-testid="button"
      onMouseEnter={handler}
      onMouseOver={handler}
      onMouseMove={handler}
    />,
  )

  userEvent.hover(screen.getByTestId('button'))
  expect(handler).toHaveBeenCalledTimes(3)
})
