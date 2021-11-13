import userEvent from '#src'
import {addListeners, setupSelect, setup} from '#testHelpers/utils'

test('fires correct events', () => {
  const {form, select, options, getEventSnapshot} = setupSelect({
    multiple: true,
  })
  options[0].selected = true

  userEvent.deselectOptions(select, '1')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[name="select"][value=[]]

    option[value="1"][selected=true] - pointerover
    select[name="select"][value=["1"]] - pointerenter
    option[value="1"][selected=true] - mouseover
    select[name="select"][value=["1"]] - mouseenter
    option[value="1"][selected=true] - pointermove
    option[value="1"][selected=true] - mousemove
    option[value="1"][selected=true] - pointerdown
    option[value="1"][selected=true] - mousedown: primary
    select[name="select"][value=["1"]] - focus
    select[name="select"][value=["1"]] - focusin
    option[value="1"][selected=true] - pointerup
    option[value="1"][selected=true] - mouseup: primary
    select[name="select"][value=[]] - input
    select[name="select"][value=[]] - change
    option[value="1"][selected=false] - click: primary
  `)

  expect(form).toHaveFormValues({select: []})
})

test('blurs previously focused element', () => {
  const {form, select} = setupSelect({multiple: true})
  const button = document.createElement('button')
  form.append(button)

  const {getEventSnapshot, clearEventCalls} = addListeners(form)
  button.focus()

  clearEventCalls()
  userEvent.deselectOptions(select, '1')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: form

    option[value="1"][selected=false] - pointerover
    option[value="1"][selected=false] - mouseover
    option[value="1"][selected=false] - pointermove
    option[value="1"][selected=false] - mousemove
    option[value="1"][selected=false] - pointerdown
    option[value="1"][selected=false] - mousedown: primary
    button - focusout
    select[name="select"][value=[]] - focusin
    option[value="1"][selected=false] - pointerup
    option[value="1"][selected=false] - mouseup: primary
    select[name="select"][value=[]] - input
    select[name="select"][value=[]] - change
    option[value="1"][selected=false] - click: primary
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
  userEvent.selectOptions(select, ['1'])

  expect(element).toHaveFormValues({select: ['1']})

  // select two and three
  userEvent.selectOptions(select, ['2', '3'])
  expect(element).toHaveFormValues({select: ['1', '2', '3']})

  // deselect one and three
  userEvent.deselectOptions(select, ['1', '3'])
  expect(element).toHaveFormValues({select: ['2']})
})

test('sets the selected prop on the selected option using option html elements', () => {
  const {select, options} = setupSelect({multiple: true})
  const [o1, o2, o3] = options
  o2.selected = true
  o3.selected = true

  userEvent.deselectOptions(select, [o3, o2])
  expect(o1.selected).toBe(false)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(false)
})

test('throws error when provided element is not a multiple select', () => {
  const {element} = setup(`<select />`)
  expect(() => userEvent.deselectOptions(element)).toThrowError(
    /unable to deselect/i,
  )
})

test('throws an error one selected option does not match', () => {
  const {element} = setup(
    `<select multiple><option value="a">A</option><option value="b">B</option></select>`,
  )

  expect(() =>
    userEvent.deselectOptions(element, 'Matches nothing'),
  ).toThrowError(/not found/i)
})
