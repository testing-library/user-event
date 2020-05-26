import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '../../src'

test.each(['select', 'select multiple'])(
  'should fire the correct events for <%s>',
  type => {
    const events = []
    const eventsHandler = jest.fn(evt => events.push(evt.type))
    const multiple = type === 'select multiple'
    const eventHandlers = {
      onMouseOver: eventsHandler,
      onMouseMove: eventsHandler,
      onMouseDown: eventsHandler,
      onFocus: eventsHandler,
      onMouseUp: eventsHandler,
      onClick: eventsHandler,
    }

    render(
      <select {...{...eventHandlers, multiple}} data-testid="element">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>,
    )

    userEvent.selectOptions(screen.getByTestId('element'), '1')

    expect(events).toEqual([
      'mouseover',
      'mousemove',
      'mousedown',
      'focus',
      'mouseup',
      'click',
      'mouseover', // The events repeat because we click on the child OPTION too
      'mousemove', // But these specifically are the events bubbling up to the <select>
      'mousedown',
      'focus',
      'mouseup',
      'click',
    ])
  },
)

test('should fire the correct events on selected OPTION child with <select>', () => {
  const events = []
  function handleEvent(evt) {
    const optValue = Number(evt.target.value)
    events[optValue] = [...(events[optValue] || []), evt.type]
  }

  const eventsHandler = jest.fn(handleEvent)
  const eventHandlers = {
    onMouseOver: eventsHandler,
    onMouseMove: eventsHandler,
    onMouseDown: eventsHandler,
    onFocus: eventsHandler,
    onMouseUp: eventsHandler,
    onClick: eventsHandler,
  }

  render(
    <select data-testid="element">
      <option {...eventHandlers} value="1">
        1
      </option>
      <option {...eventHandlers} value="2">
        2
      </option>
      <option {...eventHandlers} value="3">
        3
      </option>
    </select>,
  )

  userEvent.selectOptions(screen.getByTestId('element'), ['2'])

  expect(events[1]).toBe(undefined)
  expect(events[3]).toBe(undefined)
  expect(events[2]).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'focus',
    'mouseup',
    'click',
  ])
})

test('should fire the correct events on selected OPTION children with <select multiple>', () => {
  const events = []
  function handleEvent(evt) {
    const optValue = Number(evt.target.value)
    events[optValue] = [...(events[optValue] || []), evt.type]
  }

  const eventsHandler = jest.fn(handleEvent)
  const eventHandlers = {
    onMouseOver: eventsHandler,
    onMouseMove: eventsHandler,
    onMouseDown: eventsHandler,
    onFocus: eventsHandler,
    onMouseUp: eventsHandler,
    onClick: eventsHandler,
  }

  render(
    <select multiple data-testid="element">
      <option {...eventHandlers} value="1">
        1
      </option>
      <option {...eventHandlers} value="2">
        2
      </option>
      <option {...eventHandlers} value="3">
        3
      </option>
    </select>,
  )

  userEvent.selectOptions(screen.getByTestId('element'), ['1', '3'])

  expect(events[2]).toBe(undefined)
  expect(events[1]).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'focus',
    'mouseup',
    'click',
  ])

  expect(events[3]).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'focus',
    'mouseup',
    'click',
  ])
})

test('sets the selected prop on the selected OPTION', () => {
  const onSubmit = jest.fn()

  render(
    <form onSubmit={onSubmit}>
      <select multiple data-testid="element">
        <option data-testid="val1" value="1">
          1
        </option>
        <option data-testid="val2" value="2">
          2
        </option>
        <option data-testid="val3" value="3">
          3
        </option>
      </select>
    </form>,
  )

  userEvent.selectOptions(screen.getByTestId('element'), ['1', '3'])

  expect(screen.getByTestId('val1').selected).toBe(true)
  expect(screen.getByTestId('val2').selected).toBe(false)
  expect(screen.getByTestId('val3').selected).toBe(true)
})

test('sets the selected prop on the selected OPTION using nodes', () => {
  render(
    <form onSubmit={() => {}}>
      <select multiple data-testid="element">
        <option data-testid="val1" value="1">
          first option
        </option>
        <option data-testid="val2" value="2">
          second option
        </option>
        <option data-testid="val3" value="3">
          third option
        </option>
      </select>
    </form>,
  )

  userEvent.selectOptions(screen.getByTestId('element'), [
    screen.getByText('second option'),
    screen.getByText('third option'),
  ])

  expect(screen.getByTestId('val1').selected).toBe(false)
  expect(screen.getByTestId('val2').selected).toBe(true)
  expect(screen.getByTestId('val3').selected).toBe(true)
})

test('sets the selected prop on the selected OPTION using htmlFor', () => {
  const onSubmit = jest.fn()

  render(
    <form onSubmit={onSubmit}>
      <label htmlFor="select">Example Select</label>
      <select id="select" data-testid="element">
        <option data-testid="val1" value="1">
          1
        </option>
        <option data-testid="val2" value="2">
          2
        </option>
        <option data-testid="val3" value="3">
          3
        </option>
      </select>
    </form>,
  )

  userEvent.selectOptions(screen.getByTestId('element'), '2')

  expect(screen.getByTestId('val1').selected).toBe(false)
  expect(screen.getByTestId('val2').selected).toBe(true)
  expect(screen.getByTestId('val3').selected).toBe(false)
})

test('should fire onChange event on a SELECT element', () => {
  const onChangeHandler = jest.fn()

  render(
    <select data-testid="element" onChange={onChangeHandler}>
      <option data-testid="val1" value="1">
        1
      </option>
      <option data-testid="val2" value="2">
        2
      </option>
      <option data-testid="val3" value="3">
        3
      </option>
    </select>,
  )

  userEvent.selectOptions(screen.getByTestId('element'), '2')

  expect(onChangeHandler).toBeCalledTimes(1)
})

test('sets the selected prop on the selected OPTION using nested SELECT', () => {
  const onSubmit = jest.fn()

  render(
    <form onSubmit={onSubmit}>
      <label>
        Example Select
        <select data-testid="element">
          <option data-testid="val1" value="1">
            1
          </option>
          <option data-testid="val2" value="2">
            2
          </option>
          <option data-testid="val3" value="3">
            3
          </option>
        </select>
      </label>
    </form>,
  )

  userEvent.selectOptions(screen.getByTestId('element'), '2')

  expect(screen.getByTestId('val1').selected).toBe(false)
  expect(screen.getByTestId('val2').selected).toBe(true)
  expect(screen.getByTestId('val3').selected).toBe(false)
})

test('sets the selected prop on the selected OPTION using OPTGROUPS', () => {
  render(
    <form>
      <select multiple data-testid="element">
        <optgroup label="test optgroup 1">
          <option data-testid="val1" value="1">
            1
          </option>
        </optgroup>
        <optgroup label="test optgroup 2">
          <option data-testid="val2" value="2">
            2
          </option>
        </optgroup>
        <optgroup label="test optgroup 1">
          <option data-testid="val3" value="3">
            3
          </option>
        </optgroup>
      </select>
    </form>,
  )

  userEvent.selectOptions(screen.getByTestId('element'), ['1', '3'])

  expect(screen.getByTestId('val1').selected).toBe(true)
  expect(screen.getByTestId('val2').selected).toBe(false)
  expect(screen.getByTestId('val3').selected).toBe(true)
})
