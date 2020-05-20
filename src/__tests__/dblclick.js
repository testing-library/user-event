import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '../../src'

test.each(['input', 'textarea'])(
  'should fire the correct events for <%s>',
  type => {
    const events = []
    const eventsHandler = jest.fn(evt => events.push(evt.type))
    render(
      React.createElement(type, {
        'data-testid': 'element',
        onMouseOver: eventsHandler,
        onMouseMove: eventsHandler,
        onMouseDown: eventsHandler,
        onFocus: eventsHandler,
        onMouseUp: eventsHandler,
        onClick: eventsHandler,
        onDoubleClick: eventsHandler,
      }),
    )

    userEvent.dblClick(screen.getByTestId('element'))

    expect(events).toEqual([
      'mouseover',
      'mousemove',
      'mousedown',
      'focus',
      'mouseup',
      'click',
      'mousedown',
      'mouseup',
      'click',
      'dblclick',
    ])
  },
)

test('should fire the correct events for <input type="checkbox">', () => {
  const events = []
  const eventsHandler = jest.fn(evt => events.push(evt.type))
  render(
    <input
      data-testid="element"
      type="checkbox"
      onMouseOver={eventsHandler}
      onMouseMove={eventsHandler}
      onMouseDown={eventsHandler}
      onFocus={eventsHandler}
      onMouseUp={eventsHandler}
      onClick={eventsHandler}
      onChange={eventsHandler}
    />,
  )

  userEvent.dblClick(screen.getByTestId('element'))

  expect(events).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'focus',
    'mouseup',
    'click',
    'change',
    'mousedown',
    'mouseup',
    'click',
    'change',
  ])

  expect(screen.getByTestId('element')).toHaveProperty('checked', false)
})

test('should fire the correct events for <div>', () => {
  const events = []
  const eventsHandler = jest.fn(evt => events.push(evt.type))
  render(
    <div
      data-testid="div"
      onMouseOver={eventsHandler}
      onMouseMove={eventsHandler}
      onMouseDown={eventsHandler}
      onFocus={eventsHandler}
      onMouseUp={eventsHandler}
      onClick={eventsHandler}
    />,
  )

  userEvent.dblClick(screen.getByTestId('div'))
  expect(events).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'mouseup',
    'click',
    'mousedown',
    'mouseup',
    'click',
  ])
})

test('should not fire blur on current element if is the same as previous', () => {
  const onBlur = jest.fn()
  const {getByText} = render(<button onBlur={onBlur}>Blur</button>)
  userEvent.dblClick(getByText('Blur'))
  expect(onBlur).not.toHaveBeenCalled()
  userEvent.dblClick(getByText('Blur'))
  expect(onBlur).not.toHaveBeenCalled()
})

test('should not blur when mousedown prevents default', () => {
  let events = []
  const eventsHandler = jest.fn(evt => events.push(evt.type))
  const commonEvents = {
    onBlur: eventsHandler,
    onMouseOver: eventsHandler,
    onMouseMove: eventsHandler,
    onMouseDown: eventsHandler,
    onFocus: eventsHandler,
    onMouseUp: eventsHandler,
    onClick: eventsHandler,
    onChange: eventsHandler,
  }

  render(
    <React.Fragment>
      <input data-testid="A" {...commonEvents} />
      <input
        data-testid="B"
        {...commonEvents}
        onMouseDown={e => {
          e.preventDefault()
          eventsHandler(e)
        }}
      />
      <input data-testid="C" {...commonEvents} />
    </React.Fragment>,
  )

  const a = screen.getByTestId('A')
  const b = screen.getByTestId('B')
  const c = screen.getByTestId('C')

  expect(a).not.toHaveFocus()
  expect(b).not.toHaveFocus()
  expect(c).not.toHaveFocus()

  userEvent.dblClick(a)
  expect(a).toHaveFocus()
  expect(b).not.toHaveFocus()
  expect(c).not.toHaveFocus()

  expect(events).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'focus',
    'mouseup',
    'click',
    'mousedown',
    'mouseup',
    'click',
  ])

  events = []

  userEvent.dblClick(b)
  expect(a).toHaveFocus()
  expect(b).not.toHaveFocus()
  expect(c).not.toHaveFocus()

  expect(events).toEqual([
    'mousemove',
    'mouseover',
    'mousemove',
    'mousedown',
    'mouseup',
    'click',
    'mousedown',
    'mouseup',
    'click',
  ])

  events = []

  userEvent.dblClick(c)
  expect(a).not.toHaveFocus()
  expect(b).not.toHaveFocus()
  expect(c).toHaveFocus()

  expect(events).toEqual([
    'mousemove',
    'mouseover',
    'mousemove',
    'mousedown',
    'blur',
    'focus',
    'mouseup',
    'click',
    'mousedown',
    'mouseup',
    'click',
  ])
})
