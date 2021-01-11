import userEvent from '../'
import {setupSelect, addListeners, setupListbox} from './helpers/utils'

test('fires correct events', () => {
  const {select, options, getEventSnapshot} = setupSelect()
  userEvent.selectOptions(select, '2')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[name="select"][value="2"]

    select[name="select"][value="1"] - pointerover
    select[name="select"][value="1"] - pointerenter
    select[name="select"][value="1"] - mouseover: Left (0)
    select[name="select"][value="1"] - mouseenter: Left (0)
    select[name="select"][value="1"] - pointermove
    select[name="select"][value="1"] - mousemove: Left (0)
    select[name="select"][value="1"] - pointerdown
    select[name="select"][value="1"] - mousedown: Left (0)
    select[name="select"][value="1"] - focus
    select[name="select"][value="1"] - focusin
    select[name="select"][value="1"] - pointerup
    select[name="select"][value="1"] - mouseup: Left (0)
    select[name="select"][value="1"] - click: Left (0)
    select[name="select"][value="2"] - input
    select[name="select"][value="2"] - change
    select[name="select"][value="2"] - pointerover
    select[name="select"][value="2"] - pointerenter
    select[name="select"][value="2"] - mouseover: Left (0)
    select[name="select"][value="2"] - mouseenter: Left (0)
    select[name="select"][value="2"] - pointerup
    select[name="select"][value="2"] - mouseup: Left (0)
    select[name="select"][value="2"] - click: Left (0)
  `)
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(false)
  expect(o2.selected).toBe(true)
  expect(o3.selected).toBe(false)
})

test('fires correct events on listBox select', () => {
  const {listbox, options, getEventSnapshot} = setupListbox()
  userEvent.selectOptions(listbox, '2')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: ul[value="2"]

    li#2[value="2"][aria-selected=true] - pointerover
    ul[value="2"] - pointerenter
    li#2[value="2"][aria-selected=true] - mouseover: Left (0)
    ul[value="2"] - mouseenter: Left (0)
    li#2[value="2"][aria-selected=true] - pointermove
    li#2[value="2"][aria-selected=true] - mousemove: Left (0)
    li#2[value="2"][aria-selected=true] - pointerover
    ul[value="2"] - pointerenter
    li#2[value="2"][aria-selected=true] - mouseover: Left (0)
    ul[value="2"] - mouseenter: Left (0)
    li#2[value="2"][aria-selected=true] - pointermove
    li#2[value="2"][aria-selected=true] - mousemove: Left (0)
    li#2[value="2"][aria-selected=true] - pointerdown
    li#2[value="2"][aria-selected=true] - mousedown: Left (0)
    li#2[value="2"][aria-selected=true] - pointerup
    li#2[value="2"][aria-selected=true] - mouseup: Left (0)
    li#2[value="2"][aria-selected=true] - click: Left (0)
    li#2[value="2"][aria-selected=true] - pointermove
    li#2[value="2"][aria-selected=true] - mousemove: Left (0)
    li#2[value="2"][aria-selected=true] - pointerout
    ul[value="2"] - pointerleave
    li#2[value="2"][aria-selected=true] - mouseout: Left (0)
    ul[value="2"] - mouseleave: Left (0)
  `)
  const [o1, o2, o3] = options
  expect(o1).toHaveAttribute('aria-selected', 'false')
  expect(o2).toHaveAttribute('aria-selected', 'true')
  expect(o3).toHaveAttribute('aria-selected', 'false')
})

test('fires correct events on multi-selects', () => {
  const {select, options, getEventSnapshot} = setupSelect({multiple: true})
  userEvent.selectOptions(select, ['1', '3'])
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[name="select"][value=["1","3"]]

    option[value="1"][selected=false] - pointerover
    select[name="select"][value=[]] - pointerenter
    option[value="1"][selected=false] - mouseover: Left (0)
    select[name="select"][value=[]] - mouseenter: Left (0)
    option[value="1"][selected=false] - pointermove
    option[value="1"][selected=false] - mousemove: Left (0)
    option[value="1"][selected=false] - pointerdown
    option[value="1"][selected=false] - mousedown: Left (0)
    select[name="select"][value=[]] - focus
    select[name="select"][value=[]] - focusin
    option[value="1"][selected=false] - pointerup
    option[value="1"][selected=false] - mouseup: Left (0)
    select[name="select"][value=["1"]] - input
    select[name="select"][value=["1"]] - change
    option[value="1"][selected=true] - click: Left (0)
    option[value="3"][selected=false] - pointerover
    select[name="select"][value=["1"]] - pointerenter
    option[value="3"][selected=false] - mouseover: Left (0)
    select[name="select"][value=["1"]] - mouseenter: Left (0)
    option[value="3"][selected=false] - pointermove
    option[value="3"][selected=false] - mousemove: Left (0)
    option[value="3"][selected=false] - pointerdown
    option[value="3"][selected=false] - mousedown: Left (0)
    option[value="3"][selected=false] - pointerup
    option[value="3"][selected=false] - mouseup: Left (0)
    select[name="select"][value=["1","3"]] - input
    select[name="select"][value=["1","3"]] - change
    option[value="3"][selected=true] - click: Left (0)
  `)
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(true)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(true)
})

test('sets the selected prop on the selected option using option html elements', () => {
  const {select, options} = setupSelect()
  const [o1, o2, o3] = options
  userEvent.selectOptions(select, o1)
  expect(o1.selected).toBe(true)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(false)
})

test('sets the selected prop on the selected listbox option using option html elements', () => {
  const {listbox, options} = setupListbox()
  const [o1, o2, o3] = options
  userEvent.selectOptions(listbox, o1)
  expect(o1).toHaveAttribute('aria-selected', 'true')
  expect(o2).toHaveAttribute('aria-selected', 'false')
  expect(o3).toHaveAttribute('aria-selected', 'false')
})

test('a previously focused input gets blurred', () => {
  const button = document.createElement('button')
  document.body.append(button)
  button.focus()
  const {getEventSnapshot} = addListeners(button)
  const {select} = setupSelect()
  userEvent.selectOptions(select, '1')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - blur
    button - focusout
  `)
})

test('throws an error one selected option does not match', () => {
  const {select} = setupSelect({multiple: true})
  expect(() =>
    userEvent.selectOptions(select, ['3', 'Matches nothing']),
  ).toThrowError(/not found/i)
})

test('throws an error if multiple are passed but not a multiple select', () => {
  const {select} = setupSelect({multiple: false})
  expect(() => userEvent.selectOptions(select, ['2', '3'])).toThrowError(
    /non-multiple select/i,
  )
})

test('does not select anything if select is disabled', () => {
  const {select, options, getEventSnapshot} = setupSelect({disabled: true})
  userEvent.selectOptions(select, '2')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: select[name="select"][value="1"]`,
  )
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(true)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(false)
})

test('does not select anything if options are disabled', () => {
  const {select, options, getEventSnapshot} = setupSelect({
    disabledOptions: true,
  })
  userEvent.selectOptions(select, '2')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: select[name="select"][value=""]`,
  )
  const [o1, o2, o3] = options
  expect(o1.selected).toBe(false)
  expect(o2.selected).toBe(false)
  expect(o3.selected).toBe(false)
})

test('should call onChange/input bubbling up the event when a new option is selected', () => {
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

  userEvent.selectOptions(select, ['1'])

  expect(onChangeForm).toHaveBeenCalledTimes(1)
  expect(onChangeSelect).toHaveBeenCalledTimes(1)
  expect(onInputSelect).toHaveBeenCalledTimes(1)
  expect(onInputForm).toHaveBeenCalledTimes(1)
})
