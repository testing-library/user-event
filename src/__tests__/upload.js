import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '../../src'

test('should fire the correct events for input', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const events = []
  const eventsHandler = jest.fn(evt => events.push(evt.type))
  const eventHandlers = {
    onMouseOver: eventsHandler,
    onMouseMove: eventsHandler,
    onMouseDown: eventsHandler,
    onFocus: eventsHandler,
    onMouseUp: eventsHandler,
    onClick: eventsHandler,
  }

  render(<input type="file" data-testid="element" {...eventHandlers} />)

  userEvent.upload(screen.getByTestId('element'), file)

  expect(events).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'focus',
    'mouseup',
    'click',
  ])
})

test('should fire the correct events with label', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})

  const inputEvents = []
  const labelEvents = []
  const eventsHandler = events => jest.fn(evt => events.push(evt.type))

  const getEventHandlers = events => ({
    onMouseOver: eventsHandler(events),
    onMouseMove: eventsHandler(events),
    onMouseDown: eventsHandler(events),
    onFocus: eventsHandler(events),
    onMouseUp: eventsHandler(events),
    onClick: eventsHandler(events),
  })

  render(
    <>
      <label
        htmlFor="element"
        data-testid="label"
        {...getEventHandlers(labelEvents)}
      >
        Element
      </label>
      <input type="file" id="element" {...getEventHandlers(inputEvents)} />
    </>,
  )

  userEvent.upload(screen.getByTestId('label'), file)

  expect(inputEvents).toEqual(['click', 'focus'])
  expect(labelEvents).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'mouseup',
    'click',
  ])
})

test('should upload the file', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  render(<input type="file" data-testid="element" />)
  const input = screen.getByTestId('element')

  userEvent.upload(input, file)

  expect(input.files[0]).toStrictEqual(file)
  expect(input.files.item(0)).toStrictEqual(file)
  expect(input.files).toHaveLength(1)
})

test('should upload multiple files', () => {
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]
  render(<input type="file" multiple data-testid="element" />)
  const input = screen.getByTestId('element')

  userEvent.upload(input, files)

  expect(input.files[0]).toStrictEqual(files[0])
  expect(input.files.item(0)).toStrictEqual(files[0])
  expect(input.files[1]).toStrictEqual(files[1])
  expect(input.files.item(1)).toStrictEqual(files[1])
  expect(input.files).toHaveLength(2)
})

test('should not upload when is disabled', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  render(<input type="file" data-testid="element" disabled />)

  const input = screen.getByTestId('element')

  userEvent.upload(input, file)

  expect(input.files[0]).toBeUndefined()
  expect(input.files.item(0)).toBeNull()
  expect(input.files).toHaveLength(0)
})
