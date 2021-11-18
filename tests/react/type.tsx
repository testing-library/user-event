import React, {useState} from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '#src'
import {addListeners} from '#testHelpers/utils'

test('trigger onChange SyntheticEvent on input', async () => {
  const inputHandler = jest.fn()
  const changeHandler = jest.fn()

  render(<input onInput={inputHandler} onChange={changeHandler} />)

  await userEvent.type(screen.getByRole('textbox'), 'abcdef')

  expect(inputHandler).toHaveBeenCalledTimes(6)
  expect(changeHandler).toHaveBeenCalledTimes(6)
})

describe('typing in a controlled input', () => {
  function DollarInput({initialValue = ''}) {
    const [val, setVal] = useState(initialValue)
    return (
      <input
        value={val}
        onChange={e => {
          const newValue = e.target.value
          const withoutDollar = newValue.replace(/\$/g, '')
          const num = Number(withoutDollar)
          if (!Number.isNaN(num)) {
            setVal(`$${withoutDollar}`)
          }
        }}
      />
    )
  }

  function setupDollarInput({initialValue = ''} = {}) {
    const {container} = render(<DollarInput initialValue={initialValue} />)
    const element = container.querySelector('input') as HTMLInputElement

    return {
      element,
      ...addListeners(element),
    }
  }

  test('typing in empty controlled input', async () => {
    const {element, getEventSnapshot} = setupDollarInput()

    await userEvent.type(element, '23')

    expect(element).toHaveValue('$23')
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="$23"]

      input[value=""] - pointerover
      input[value=""] - pointerenter
      input[value=""] - mouseover
      input[value=""] - mouseenter
      input[value=""] - pointermove
      input[value=""] - mousemove
      input[value=""] - pointerdown
      input[value=""] - mousedown: primary
      input[value=""] - focus
      input[value=""] - focusin
      input[value=""] - pointerup
      input[value=""] - mouseup: primary
      input[value=""] - click: primary
      input[value=""] - keydown: 2
      input[value=""] - keypress: 2
      input[value="2"] - input
        "2{CURSOR}" -> "$2{CURSOR}"
      input[value="$2"] - keyup: 2
      input[value="$2"] - keydown: 3
      input[value="$2"] - keypress: 3
      input[value="$23"] - input
      input[value="$23"] - keyup: 3
    `)
  })

  test('typing in the middle of a controlled input', async () => {
    const {element, getEventSnapshot} = setupDollarInput({initialValue: '$23'})

    await userEvent.type(element, '1', {initialSelectionStart: 2})

    expect(element).toHaveValue('$213')
    expect(element).toHaveProperty('selectionStart', 3)
    expect(element).toHaveProperty('selectionEnd', 3)

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="$213"]

      input[value="$23"] - pointerover
      input[value="$23"] - pointerenter
      input[value="$23"] - mouseover
      input[value="$23"] - mouseenter
      input[value="$23"] - pointermove
      input[value="$23"] - mousemove
      input[value="$23"] - pointerdown
      input[value="$23"] - mousedown: primary
      input[value="$23"] - focus
      input[value="$23"] - focusin
      input[value="$23"] - pointerup
      input[value="$23"] - mouseup: primary
      input[value="$23"] - click: primary
      input[value="$23"] - select
      input[value="$23"] - keydown: 1
      input[value="$23"] - keypress: 1
      input[value="$213"] - select
      input[value="$213"] - input
        "$21{CURSOR}3" -> "$213{CURSOR}"
      input[value="$213"] - select
      input[value="$213"] - keyup: 1
    `)
  })

  test('ignored {backspace} in controlled input', async () => {
    const {element, getEventSnapshot} = setupDollarInput({initialValue: '$23'})

    await userEvent.type(element, '{backspace}', {
      initialSelectionStart: 1,
      initialSelectionEnd: 1,
    })
    // this is the same behavior in the browser.
    // in our case, when you try to backspace the "$", our event handler
    // will ignore that change and React resets the value to what it was
    // before. When the value is set programmatically to something different
    // from what was expected based on the input event, the browser sets
    // the selection start and end to the end of the input
    expect(element.selectionStart).toBe(element.value.length)
    expect(element.selectionEnd).toBe(element.value.length)
    await userEvent.type(element, '4')

    expect(element).toHaveValue('$234')
    // the backslash in the inline snapshot is to escape the $ before {CURSOR}
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="$234"]

      input[value="$23"] - pointerover
      input[value="$23"] - pointerenter
      input[value="$23"] - mouseover
      input[value="$23"] - mouseenter
      input[value="$23"] - pointermove
      input[value="$23"] - mousemove
      input[value="$23"] - pointerdown
      input[value="$23"] - mousedown: primary
      input[value="$23"] - focus
      input[value="$23"] - focusin
      input[value="$23"] - pointerup
      input[value="$23"] - mouseup: primary
      input[value="$23"] - click: primary
      input[value="$23"] - select
      input[value="$23"] - keydown: Backspace
      input[value="23"] - select
      input[value="23"] - input
        "{CURSOR}23" -> "$23{CURSOR}"
      input[value="$23"] - keyup: Backspace
      input[value="$23"] - pointerover
      input[value="$23"] - pointerenter
      input[value="$23"] - mouseover
      input[value="$23"] - mouseenter
      input[value="$23"] - pointermove
      input[value="$23"] - mousemove
      input[value="$23"] - pointerdown
      input[value="$23"] - mousedown: primary
      input[value="$23"] - pointerup
      input[value="$23"] - mouseup: primary
      input[value="$23"] - click: primary
      input[value="$23"] - keydown: 4
      input[value="$23"] - keypress: 4
      input[value="$234"] - input
      input[value="$234"] - keyup: 4
    `)
  })
})
