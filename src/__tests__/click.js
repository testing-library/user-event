import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '..'
import {setup} from './helpers/utils'

test('click in input', () => {
  const {element, getEventCalls} = setup(<input />)
  userEvent.click(element)
  expect(getEventCalls()).toMatchInlineSnapshot(`
    mouseover: Left (0)
    mousemove: Left (0)
    mousedown: Left (0)
    focus
    mouseup: Left (0)
    click: Left (0)
  `)
})

test('click in textarea', () => {
  const {element, getEventCalls} = setup(<textarea />)
  userEvent.click(element)
  expect(getEventCalls()).toMatchInlineSnapshot(`
    mouseover: Left (0)
    mousemove: Left (0)
    mousedown: Left (0)
    focus
    mouseup: Left (0)
    click: Left (0)
  `)
})

it('should fire the correct events for <input type="checkbox">', () => {
  const {element, getEventCalls} = setup(<input type="checkbox" />)
  expect(element).not.toBeChecked()
  userEvent.click(element)
  expect(getEventCalls()).toMatchInlineSnapshot(`
    mouseover: Left (0)
    mousemove: Left (0)
    mousedown: Left (0)
    focus
    mouseup: Left (0)
    click: unchecked -> checked
    input: checked
    change
  `)
})

it('should fire the correct events for <input type="checkbox" disabled>', () => {
  const {element, getEventCalls} = setup(<input type="checkbox" disabled />)
  userEvent.click(element)
  expect(element).toBeDisabled()
  // no event calls is expected here:
  expect(getEventCalls()).toMatchInlineSnapshot(``)
  expect(element).toBeDisabled()
})

// TODO: Update all these tests to use the setup util...

it('should fire the correct events for <input type="radio">', () => {
  const events = []
  const eventsHandler = jest.fn(evt => events.push(evt.type))
  render(
    <input
      data-testid="element"
      type="radio"
      onMouseOver={eventsHandler}
      onMouseMove={eventsHandler}
      onMouseDown={eventsHandler}
      onFocus={eventsHandler}
      onMouseUp={eventsHandler}
      onClick={eventsHandler}
      onChange={eventsHandler}
    />,
  )

  userEvent.click(screen.getByTestId('element'))

  expect(events).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'focus',
    'mouseup',
    'click',
    'change',
  ])

  expect(screen.getByTestId('element')).toHaveProperty('checked', true)
})

it('should fire the correct events for <input type="radio" disabled>', () => {
  const events = []
  const eventsHandler = jest.fn(evt => events.push(evt.type))
  render(
    <input
      data-testid="element"
      type="radio"
      onMouseOver={eventsHandler}
      onMouseMove={eventsHandler}
      onMouseDown={eventsHandler}
      onFocus={eventsHandler}
      onMouseUp={eventsHandler}
      onClick={eventsHandler}
      onChange={eventsHandler}
      disabled
    />,
  )

  userEvent.click(screen.getByTestId('element'))

  expect(events).toEqual([])

  expect(screen.getByTestId('element')).toHaveProperty('checked', false)
})

it('should fire the correct events for <div>', () => {
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

  userEvent.click(screen.getByTestId('div'))
  expect(events).toEqual([
    'mouseover',
    'mousemove',
    'mousedown',
    'mouseup',
    'click',
  ])
})

it('toggles the focus', () => {
  render(
    <React.Fragment>
      <input data-testid="A" />
      <input data-testid="B" />
    </React.Fragment>,
  )

  const a = screen.getByTestId('A')
  const b = screen.getByTestId('B')

  expect(a).not.toHaveFocus()
  expect(b).not.toHaveFocus()

  userEvent.click(a)
  expect(a).toHaveFocus()
  expect(b).not.toHaveFocus()

  userEvent.click(b)
  expect(a).not.toHaveFocus()
  expect(b).toHaveFocus()
})

it('should not blur when mousedown prevents default', () => {
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

  userEvent.click(a)
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
  ])

  events = []

  userEvent.click(b)
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
  ])

  events = []

  userEvent.click(c)
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
  ])
})

it('does not lose focus when click updates focus', () => {
  const FocusComponent = () => {
    const inputRef = React.useRef()
    const focusInput = () => inputRef.current.focus()

    return (
      <React.Fragment>
        <input data-testid="input" ref={inputRef} />
        <button onClick={focusInput}>Update Focus</button>
      </React.Fragment>
    )
  }
  render(<FocusComponent />)

  const input = screen.getByTestId('input')
  const button = screen.getByText('Update Focus')

  expect(input).not.toHaveFocus()

  userEvent.click(button)
  expect(input).toHaveFocus()

  userEvent.click(button)
  expect(input).toHaveFocus()
})

test.each(['input', 'textarea'])(
  'gives focus to <%s> when clicking a <label> with htmlFor',
  type => {
    render(
      <React.Fragment>
        <label htmlFor="input" data-testid="label">
          Label
        </label>
        {React.createElement(type, {id: 'input', 'data-testid': 'input'})}
      </React.Fragment>,
    )
    userEvent.click(screen.getByTestId('label'))
    expect(screen.getByTestId('input')).toHaveFocus()
  },
)

test.each(['input', 'textarea'])(
  'gives focus to <%s> when clicking a <label> without htmlFor',
  type => {
    render(
      <div>
        <label data-testid="label">
          Label
          {React.createElement(type, {'data-testid': 'input'})}
        </label>
      </div>,
    )
    userEvent.click(screen.getByTestId('label'))
    expect(screen.getByTestId('input')).toHaveFocus()
  },
)

test.each(['input', 'textarea'])(
  'gives focus to <%s> when clicking on an element contained within a <label>',
  type => {
    render(
      <React.Fragment>
        <label htmlFor="input" data-testid="label">
          <span>Label</span>
        </label>
        {React.createElement(type, {id: 'input', 'data-testid': 'input'})}
      </React.Fragment>,
    )
    userEvent.click(screen.getByText('Label'))
    expect(screen.getByTestId('input')).toHaveFocus()
  },
)

it('checks <input type="checkbox"> when clicking a <label> with htmlFor', () => {
  render(
    <React.Fragment>
      <label htmlFor="input" data-testid="label">
        Label
      </label>
      <input id="input" data-testid="input" type="checkbox" />
    </React.Fragment>,
  )
  expect(screen.getByTestId('input')).toHaveProperty('checked', false)
  userEvent.click(screen.getByTestId('label'))
  expect(screen.getByTestId('input')).toHaveProperty('checked', true)
})

it('checks <input type="checkbox"> when clicking a <label> without htmlFor', () => {
  render(
    <div>
      <label data-testid="label">
        Label
        <input id="input" data-testid="input" type="checkbox" />
      </label>
    </div>,
  )
  expect(screen.getByTestId('input')).toHaveProperty('checked', false)
  userEvent.click(screen.getByTestId('label'))
  expect(screen.getByTestId('input')).toHaveProperty('checked', true)
})

it('should submit a form when clicking on a <button>', () => {
  const onSubmit = jest.fn(e => e.preventDefault())
  const {getByText} = render(
    <form onSubmit={onSubmit}>
      <button>Submit</button>
    </form>,
  )
  userEvent.click(getByText('Submit'))
  expect(onSubmit).toHaveBeenCalledTimes(1)
})

it('should not submit a form when clicking on a <button type="button">', () => {
  const onSubmit = jest.fn(e => e.preventDefault())
  const {getByText} = render(
    <form onSubmit={onSubmit}>
      <button type="button">Submit</button>
    </form>,
  )
  userEvent.click(getByText('Submit'))
  expect(onSubmit).not.toHaveBeenCalled()
})

it('should not fire blur on current element if is the same as previous', () => {
  const onBlur = jest.fn()
  const {getByText} = render(<button onBlur={onBlur}>Blur</button>)
  userEvent.click(getByText('Blur'))
  expect(onBlur).not.toHaveBeenCalled()
  userEvent.click(getByText('Blur'))
  expect(onBlur).not.toHaveBeenCalled()
})

test.each(['input', 'textarea'])(
  'should not give focus for <%s> when mouseDown is prevented',
  type => {
    render(
      React.createElement(type, {
        'data-testid': 'element',
        onMouseDown: evt => {
          evt.preventDefault()
        },
      }),
    )

    userEvent.click(screen.getByTestId('element'))

    expect(screen.getByTestId('element')).not.toHaveFocus()
  },
)

it('should fire mouse events with the correct properties', () => {
  const events = []
  const eventsHandler = jest.fn(evt =>
    events.push({
      type: evt.type,
      button: evt.button,
      buttons: evt.buttons,
      detail: evt.detail,
    }),
  )
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

  userEvent.click(screen.getByTestId('div'))
  expect(events).toEqual([
    {
      type: 'mouseover',
      button: 0,
      buttons: 0,
      detail: 0,
    },
    {
      type: 'mousemove',
      button: 0,
      buttons: 0,
      detail: 0,
    },
    {
      type: 'mousedown',
      button: 0,
      buttons: 1,
      detail: 1,
    },
    {
      type: 'mouseup',
      button: 0,
      buttons: 1,
      detail: 1,
    },
    {
      type: 'click',
      button: 0,
      buttons: 1,
      detail: 1,
    },
  ])
})

it('should fire mouse events with custom button property', () => {
  const events = []
  const eventsHandler = jest.fn(evt =>
    events.push({
      type: evt.type,
      button: evt.button,
      buttons: evt.buttons,
      detail: evt.detail,
      altKey: evt.altKey,
    }),
  )
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

  userEvent.click(screen.getByTestId('div'), {
    button: 1,
    altKey: true,
  })

  expect(events).toEqual([
    {
      type: 'mouseover',
      button: 0,
      buttons: 0,
      detail: 0,
      altKey: true,
    },
    {
      type: 'mousemove',
      button: 0,
      buttons: 0,
      detail: 0,
      altKey: true,
    },
    {
      type: 'mousedown',
      button: 1,
      buttons: 4,
      detail: 1,
      altKey: true,
    },
    {
      type: 'mouseup',
      button: 1,
      buttons: 4,
      detail: 1,
      altKey: true,
    },
    {
      type: 'click',
      button: 1,
      buttons: 4,
      detail: 1,
      altKey: true,
    },
  ])
})

it('should fire mouse events with custom buttons property', () => {
  const events = []
  const eventsHandler = jest.fn(evt =>
    events.push({
      type: evt.type,
      button: evt.button,
      buttons: evt.buttons,
      detail: evt.detail,
    }),
  )
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

  userEvent.click(screen.getByTestId('div'), {
    buttons: 4,
  })

  expect(events).toEqual([
    {
      type: 'mouseover',
      button: 0,
      buttons: 0,
      detail: 0,
    },
    {
      type: 'mousemove',
      button: 0,
      buttons: 0,
      detail: 0,
    },
    {
      type: 'mousedown',
      button: 1,
      buttons: 4,
      detail: 1,
    },
    {
      type: 'mouseup',
      button: 1,
      buttons: 4,
      detail: 1,
    },
    {
      type: 'click',
      button: 1,
      buttons: 4,
      detail: 1,
    },
  ])
})
