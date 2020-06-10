import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '..'
import {setup} from './helpers/utils'

test('unhover', () => {
  const {element, getEventCalls} = setup(<button />)

  userEvent.unhover(element)
  expect(getEventCalls()).toMatchInlineSnapshot(`
    mousemove: Left (0)
    mouseout: Left (0)
    mouseleave: Left (0)
  `)
})

test('unhover should fire events', () => {
  const handler = jest.fn()
  render(
    // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
    <button
      data-testid="button"
      onMouseMove={handler}
      onMouseOut={handler}
      onMouseLeave={handler}
    />,
  )

  userEvent.unhover(screen.getByTestId('button'))
  expect(handler).toHaveBeenCalledTimes(3)
})
