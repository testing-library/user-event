import {render, screen} from '@testing-library/react'
import React from 'react'
import userEvent from '..'
import {addListeners, setup} from './helpers/utils'

test('should fire the correct events for multiple select', () => {
  const {element: select, getEventCalls} = setup(
    <select multiple>
      <option value="1">One</option>
      <option value="2">Two</option>
      <option value="3">Three</option>
    </select>,
  )

  userEvent.toggleSelectOptions(select, '1')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    mouseover: Left (0)
    mousemove: Left (0)
    mousedown: Left (0)
    focus
    mouseup: Left (0)
    click: Left (0)
    mouseover: Left (0)
    mousemove: Left (0)
    mousedown: Left (0)
    mouseup: Left (0)
    click: Left (0)
    change
  `)

  expect(screen.getByRole('listbox').value).toBe('1')
})

test('should fire the correct events for multiple select when focus is in other element', () => {
  const {element: select, getEventCalls} = setup(
    <>
      <select multiple>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
      </select>
      <button tabIndex={0}>Other</button>
    </>,
  )

  const $otherBtn = screen.getByRole('button')

  const {getEventCalls: getButtonEvents} = addListeners($otherBtn)

  $otherBtn.focus()

  userEvent.toggleSelectOptions(select, '1')

  expect(getButtonEvents()).toMatchInlineSnapshot(`
    focus
    mousemove: Left (0)
    mouseleave: Left (0)
    blur
  `)
  expect(getEventCalls()).toMatchInlineSnapshot(`
    mouseover: Left (0)
    mousemove: Left (0)
    mousedown: Left (0)
    focus
    mouseup: Left (0)
    click: Left (0)
    mouseover: Left (0)
    mousemove: Left (0)
    mousedown: Left (0)
    mouseup: Left (0)
    click: Left (0)
    change
  `)
})

test('toggle options as expected', () => {
  const TestBed = () => {
    const [selected, setSelected] = React.useState([])

    return (
      <>
        <select
          value={selected}
          onChange={ev => {
            const options = ev.target.options
            const result = []

            for (let i = 0; i < options.length; i++) {
              if (options[i].selected) {
                result.push(options[i].value)
              }
            }

            setSelected(result)
          }}
          multiple
        >
          <option value="1">One</option>
          <optgroup label="Group Name">
            <option value="2">Two</option>
            <option value="3">Three</option>
          </optgroup>
        </select>
        <output>{selected.join(', ')}</output>
      </>
    )
  }

  render(<TestBed />)

  // select one
  userEvent.toggleSelectOptions(screen.getByRole('listbox'), ['1'])
  expect(screen.getByRole('status')).toHaveTextContent('1')

  // unselect one and select two
  userEvent.toggleSelectOptions(screen.getByRole('listbox'), ['1', '2'])
  expect(screen.getByRole('status')).toHaveTextContent('2')

  // select one
  userEvent.toggleSelectOptions(screen.getByRole('listbox'), ['1'])
  expect(screen.getByRole('status')).toHaveTextContent('1, 2')
})

it('throws error when provided element is not a multiple select', () => {
  const {element: select} = setup(
    <select>
      <option value="one">1</option>
    </select>,
  )

  expect(() => {
    userEvent.toggleSelectOptions(select)
  }).toThrowErrorMatchingInlineSnapshot(
    `Unable to toggleSelectOptions - please provide a select element with multiple=true`,
  )
})
