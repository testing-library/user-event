import {setupSelect} from './_setup'
import {addListeners, setup} from '#testHelpers'

test('fires correct events', async () => {
  const {form, select, options, getEventSnapshot, user} = setupSelect({
    multiple: true,
  })
  options[0].selected = true

  await user.deselectOptions(select, '1')

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

test('blurs previously focused element', async () => {
  const {form, select, user} = setupSelect({multiple: true})
  const button = document.createElement('button')
  form.append(button)

  const {getEventSnapshot, clearEventCalls} = addListeners(form)
  button.focus()

  clearEventCalls()
  await user.deselectOptions(select, '1')

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

test('toggle options as expected', async () => {
  const {element, user} = setup(`
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

  const select = element.querySelector('select') as HTMLSelectElement

  // select one
  await user.selectOptions(select, ['1'])

  expect(element).toHaveFormValues({select: ['1']})

  // select two and three
  await user.selectOptions(select, ['2', '3'])
  expect(element).toHaveFormValues({select: ['1', '2', '3']})

  // deselect one and three
  await user.deselectOptions(select, ['1', '3'])
  expect(element).toHaveFormValues({select: ['2']})
})

test('sets the selected prop on the selected option using option html elements', async () => {
  const {select, options, user} = setupSelect({multiple: true})
  const [o1, o2, o3] = options
  o2.selected = true
  o3.selected = true

  await user.deselectOptions(select, [o3, o2])
  expect(o1.selected).toBe(false)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(false)
})

test('throws error when provided element is not a multiple select', async () => {
  const {element, user} = setup(`<select />`)
  await expect(user.deselectOptions(element, [])).rejects.toThrowError(
    /unable to deselect/i,
  )
})

test('throws an error one selected option does not match', async () => {
  const {element, user} = setup(
    `<select multiple><option value="a">A</option><option value="b">B</option></select>`,
  )

  await expect(
    user.deselectOptions(element, 'Matches nothing'),
  ).rejects.toThrowError(/not found/i)
})
