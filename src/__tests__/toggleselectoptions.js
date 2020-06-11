import userEvent from '..'
import {addListeners, setup} from './helpers/utils'

function setupSelect(ui) {
  const utils = setup(`<form>${ui}</form>`)
  const select = utils.element.querySelector('select')
  return {...utils, form: utils.element, select, ...addListeners(select)}
}

test('should fire the correct events for multiple select', () => {
  const {form, select, getEventCalls} = setupSelect(`
    <select name="select" multiple>
      <option value="1">One</option>
      <option value="2">Two</option>
      <option value="3">Three</option>
    </select>
  `)

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

  expect(form).toHaveFormValues({select: ['1']})
})

test('should fire the correct events for multiple select when focus is in other element', () => {
  const {form, select} = setupSelect(`
    <select name="select" multiple>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
    </select>
    <button>Other</button>
  `)

  const button = form.querySelector('button')

  const {getEventCalls: getSelectEventCalls} = addListeners(select)
  const {getEventCalls: getButtonEventCalls} = addListeners(button)

  button.focus()

  userEvent.toggleSelectOptions(select, '1')

  expect(getButtonEventCalls()).toMatchInlineSnapshot(`
    focus
    mousemove: Left (0)
    mouseleave: Left (0)
    blur
  `)
  expect(getSelectEventCalls()).toMatchInlineSnapshot(`
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
  const {element} = setup(`
    <form>
      <select name="select" multiple>
        <option value="1">One</option>
        <optgroup label="Group Name">
          <option value="2">Two</option>
          <option value="3">Three</option>
        </optgroup>
      </select>
    </form>
  `)

  const select = element.querySelector('select')

  // select one
  userEvent.toggleSelectOptions(select, ['1'])
  expect(element).toHaveFormValues({select: ['1']})

  // unselect one and select two
  userEvent.toggleSelectOptions(select, ['1', '2'])
  expect(element).toHaveFormValues({select: ['2']})

  // // select one
  userEvent.toggleSelectOptions(select, ['1'])
  expect(element).toHaveFormValues({select: ['1', '2']})
})

it('throws error when provided element is not a multiple select', () => {
  const {element} = setup(`<select />`)

  expect(() => {
    userEvent.toggleSelectOptions(element)
  }).toThrowErrorMatchingInlineSnapshot(
    `Unable to toggleSelectOptions - please provide a select element with multiple=true`,
  )
})
