import userEvent from '#src'
import {
  setupSelect,
  addListeners,
  setupListbox,
  setup,
} from '#testHelpers/utils'

test('fires correct events', async () => {
  const {select, options, getEventSnapshot} = setupSelect()
  await userEvent.selectOptions(select, '2')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[name="select"][value="2"]

    select[name="select"][value="1"] - pointerover
    select[name="select"][value="1"] - pointerenter
    select[name="select"][value="1"] - mouseover
    select[name="select"][value="1"] - mouseenter
    select[name="select"][value="1"] - pointermove
    select[name="select"][value="1"] - mousemove
    select[name="select"][value="1"] - pointerdown
    select[name="select"][value="1"] - mousedown: primary
    select[name="select"][value="1"] - focus
    select[name="select"][value="1"] - focusin
    select[name="select"][value="1"] - pointerup
    select[name="select"][value="1"] - mouseup: primary
    select[name="select"][value="1"] - click: primary
    select[name="select"][value="2"] - input
    select[name="select"][value="2"] - change
    select[name="select"][value="2"] - pointerover
    select[name="select"][value="2"] - pointerenter
    select[name="select"][value="2"] - mouseover
    select[name="select"][value="2"] - mouseenter
    select[name="select"][value="2"] - pointerup
    select[name="select"][value="2"] - mouseup: primary
    select[name="select"][value="2"] - click: primary
  `)
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(false)
  expect(o2.selected).toBe(true)
  expect(o3.selected).toBe(false)
})

test('fires correct events on listBox select', async () => {
  const {listbox, options, getEventSnapshot} = setupListbox()
  await userEvent.selectOptions(listbox, '2')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: ul[value="2"]

    li#2[value="2"][aria-selected=false] - pointerover
    li#2[value="2"][aria-selected=false] - mouseover
    li#2[value="2"][aria-selected=false] - pointermove
    li#2[value="2"][aria-selected=false] - mousemove
    li#2[value="2"][aria-selected=false] - pointerdown
    li#2[value="2"][aria-selected=false] - mousedown: primary
    li#2[value="2"][aria-selected=false] - pointerup
    li#2[value="2"][aria-selected=false] - mouseup: primary
    li#2[value="2"][aria-selected=true] - click: primary
    li#2[value="2"][aria-selected=true] - pointermove
    li#2[value="2"][aria-selected=true] - mousemove
    li#2[value="2"][aria-selected=true] - pointerout
    li#2[value="2"][aria-selected=true] - mouseout
  `)
  const [o1, o2, o3] = options
  expect(o1).toHaveAttribute('aria-selected', 'false')
  expect(o2).toHaveAttribute('aria-selected', 'true')
  expect(o3).toHaveAttribute('aria-selected', 'false')
})

test('fires correct events on multi-selects', async () => {
  const {select, options, getEventSnapshot} = setupSelect({multiple: true})
  await userEvent.selectOptions(select, ['1', '3'])
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[name="select"][value=["1","3"]]

    option[value="1"][selected=false] - pointerover
    select[name="select"][value=[]] - pointerenter
    option[value="1"][selected=false] - mouseover
    select[name="select"][value=[]] - mouseenter
    option[value="1"][selected=false] - pointermove
    option[value="1"][selected=false] - mousemove
    option[value="1"][selected=false] - pointerdown
    option[value="1"][selected=false] - mousedown: primary
    select[name="select"][value=[]] - focus
    select[name="select"][value=[]] - focusin
    option[value="1"][selected=false] - pointerup
    option[value="1"][selected=false] - mouseup: primary
    select[name="select"][value=["1"]] - input
    select[name="select"][value=["1"]] - change
    option[value="1"][selected=true] - click: primary
    option[value="3"][selected=false] - pointerover
    select[name="select"][value=["1"]] - pointerenter
    option[value="3"][selected=false] - mouseover
    select[name="select"][value=["1"]] - mouseenter
    option[value="3"][selected=false] - pointermove
    option[value="3"][selected=false] - mousemove
    option[value="3"][selected=false] - pointerdown
    option[value="3"][selected=false] - mousedown: primary
    option[value="3"][selected=false] - pointerup
    option[value="3"][selected=false] - mouseup: primary
    select[name="select"][value=["1","3"]] - input
    select[name="select"][value=["1","3"]] - change
    option[value="3"][selected=true] - click: primary
  `)
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(true)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(true)
})

test('sets the selected prop on the selected option using option html elements', async () => {
  const {select, options} = setupSelect()
  const [o1, o2, o3] = options
  await userEvent.selectOptions(select, o1)
  expect(o1.selected).toBe(true)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(false)
})

test('sets the selected prop on the selected listbox option using option html elements', async () => {
  const {listbox, options} = setupListbox()
  const [o1, o2, o3] = options
  await userEvent.selectOptions(listbox, o1)
  expect(o1).toHaveAttribute('aria-selected', 'true')
  expect(o2).toHaveAttribute('aria-selected', 'false')
  expect(o3).toHaveAttribute('aria-selected', 'false')
})

test('a previously focused input gets blurred', async () => {
  const button = document.createElement('button')
  document.body.append(button)
  button.focus()
  const {getEventSnapshot} = addListeners(button)
  const {select} = setupSelect()
  await userEvent.selectOptions(select, '1')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - blur
    button - focusout
  `)
})

test('throws an error if elements is neither select nor listbox', async () => {
  const {element} = setup(`<ul><li role='option'>foo</li></ul>`)
  await expect(userEvent.selectOptions(element, ['foo'])).rejects.toThrowError(
    /neither select nor listbox/i,
  )
})

test('throws an error one selected option does not match', async () => {
  const {select} = setupSelect({multiple: true})
  await expect(
    userEvent.selectOptions(select, ['3', 'Matches nothing']),
  ).rejects.toThrowError(/not found/i)
})

test('throws an error if multiple are passed but not a multiple select', async () => {
  const {select} = setupSelect({multiple: false})
  await expect(
    userEvent.selectOptions(select, ['2', '3']),
  ).rejects.toThrowError(/non-multiple select/i)
})

test('does not select anything if select is disabled', async () => {
  const {select, options, getEventSnapshot} = setupSelect({disabled: true})
  await userEvent.selectOptions(select, '2')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: select[name="select"][value="1"]`,
  )
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(true)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(false)
})

test('does not select anything if options are disabled', async () => {
  const {select, options, getEventSnapshot} = setupSelect({
    disabledOptions: true,
  })
  await userEvent.selectOptions(select, '2')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: select[name="select"][value=""]`,
  )
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(false)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(false)
})

test('should call onChange/input bubbling up the event when a new option is selected', async () => {
  const {select, form} = setupSelect({multiple: true})
  const onChangeSelect = jest.fn()
  const onChangeForm = jest.fn()
  const onInputSelect = jest.fn()
  const onInputForm = jest.fn()
  addListeners(select, {
    eventHandlers: {change: onChangeSelect, input: onInputSelect},
  })
  addListeners(form, {
    eventHandlers: {change: onChangeForm, input: onInputForm},
  })

  expect(onChangeSelect).toHaveBeenCalledTimes(0)
  expect(onChangeForm).toHaveBeenCalledTimes(0)
  expect(onInputSelect).toHaveBeenCalledTimes(0)
  expect(onInputForm).toHaveBeenCalledTimes(0)

  await userEvent.selectOptions(select, ['1'])

  expect(onChangeForm).toHaveBeenCalledTimes(1)
  expect(onChangeSelect).toHaveBeenCalledTimes(1)
  expect(onInputSelect).toHaveBeenCalledTimes(1)
  expect(onInputForm).toHaveBeenCalledTimes(1)
})

test('fire no pointer events when select has disabled pointer events', async () => {
  const {select, options, getEventSnapshot} = setupSelect({
    pointerEvents: 'none',
  })
  await userEvent.selectOptions(select, '2')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[name="select"][value="2"]

    select[name="select"][value="1"] - focus
    select[name="select"][value="1"] - focusin
    select[name="select"][value="2"] - input
    select[name="select"][value="2"] - change
  `)
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(false)
  expect(o2.selected).toBe(true)
  expect(o3.selected).toBe(false)
})

test('fire no pointer events when multiple select has disabled pointer events', async () => {
  const {select, options, getEventSnapshot} = setupSelect({
    multiple: true,
    pointerEvents: 'none',
  })
  await userEvent.selectOptions(select, ['2', '3'])
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[name="select"][value=["2","3"]]

    select[name="select"][value=[]] - focus
    select[name="select"][value=[]] - focusin
    select[name="select"][value=["2"]] - input
    select[name="select"][value=["2"]] - change
    select[name="select"][value=["2","3"]] - input
    select[name="select"][value=["2","3"]] - change
  `)
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(false)
  expect(o2.selected).toBe(true)
  expect(o3.selected).toBe(true)
})

test('fires correct events when pointer events set to none but skipPointerEvents is set', async () => {
  const {select, options, getEventSnapshot} = setupSelect({
    pointerEvents: 'none',
  })
  await userEvent.selectOptions(select, '2', {
    skipPointerEventsCheck: true,
  })
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[name="select"][value="2"]

    select[name="select"][value="1"] - pointerover
    select[name="select"][value="1"] - pointerenter
    select[name="select"][value="1"] - mouseover
    select[name="select"][value="1"] - mouseenter
    select[name="select"][value="1"] - pointermove
    select[name="select"][value="1"] - mousemove
    select[name="select"][value="1"] - pointerdown
    select[name="select"][value="1"] - mousedown: primary
    select[name="select"][value="1"] - focus
    select[name="select"][value="1"] - focusin
    select[name="select"][value="1"] - pointerup
    select[name="select"][value="1"] - mouseup: primary
    select[name="select"][value="1"] - click: primary
    select[name="select"][value="2"] - input
    select[name="select"][value="2"] - change
    select[name="select"][value="2"] - pointerover
    select[name="select"][value="2"] - pointerenter
    select[name="select"][value="2"] - mouseover
    select[name="select"][value="2"] - mouseenter
    select[name="select"][value="2"] - pointerup
    select[name="select"][value="2"] - mouseup: primary
    select[name="select"][value="2"] - click: primary
  `)
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(false)
  expect(o2.selected).toBe(true)
  expect(o3.selected).toBe(false)
})

test('fires correct events on multi-selects when pointer events is set and skipPointerEventsCheck is set', async () => {
  const {select, options, getEventSnapshot} = setupSelect({
    multiple: true,
    pointerEvents: 'none',
  })
  await userEvent.selectOptions(select, ['1', '3'], {
    skipPointerEventsCheck: true,
  })
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[name="select"][value=["1","3"]]

    option[value="1"][selected=false] - pointerover
    select[name="select"][value=[]] - pointerenter
    option[value="1"][selected=false] - mouseover
    select[name="select"][value=[]] - mouseenter
    option[value="1"][selected=false] - pointermove
    option[value="1"][selected=false] - mousemove
    option[value="1"][selected=false] - pointerdown
    option[value="1"][selected=false] - mousedown: primary
    select[name="select"][value=[]] - focus
    select[name="select"][value=[]] - focusin
    option[value="1"][selected=false] - pointerup
    option[value="1"][selected=false] - mouseup: primary
    select[name="select"][value=["1"]] - input
    select[name="select"][value=["1"]] - change
    option[value="1"][selected=true] - click: primary
    option[value="3"][selected=false] - pointerover
    select[name="select"][value=["1"]] - pointerenter
    option[value="3"][selected=false] - mouseover
    select[name="select"][value=["1"]] - mouseenter
    option[value="3"][selected=false] - pointermove
    option[value="3"][selected=false] - mousemove
    option[value="3"][selected=false] - pointerdown
    option[value="3"][selected=false] - mousedown: primary
    option[value="3"][selected=false] - pointerup
    option[value="3"][selected=false] - mouseup: primary
    select[name="select"][value=["1","3"]] - input
    select[name="select"][value=["1","3"]] - change
    option[value="3"][selected=true] - click: primary
  `)
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(true)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(true)
})
