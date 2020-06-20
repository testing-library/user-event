import userEvent from '../'
import {setup} from './helpers/utils'

test('presses arrow keys on active element', () => {
  const {element, getEventSnapshot} = setup('<div tabindex="0"/>')
  userEvent.click(element)
  userEvent.keyPress('ArrowDown')
  userEvent.keyPress('ArrowLeft')
  userEvent.keyPress('ArrowRight')
  userEvent.keyPress('ArrowUp')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: ArrowDown (0)
    div - keyup: ArrowDown (0)
    div - keydown: ArrowLeft (0)
    div - keyup: ArrowLeft (0)
    div - keydown: ArrowRight (0)
    div - keyup: ArrowRight (0)
    div - keydown: ArrowUp (0)
    div - keyup: ArrowUp (0)
  `)
})

test('presses home and end keys on active element', () => {
  const {element, getEventSnapshot} = setup('<div tabindex="0"/>')
  userEvent.click(element)
  userEvent.keyPress('Home')
  userEvent.keyPress('End')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: Home (0)
    div - keyup: Home (0)
    div - keydown: End (0)
    div - keyup: End (0)
  `)
})

test('presses page up and page down keys on active element', () => {
  const {element, getEventSnapshot} = setup('<div tabindex="0"/>')
  userEvent.click(element)
  userEvent.keyPress('PageUp')
  userEvent.keyPress('PageDown')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: PageUp (0)
    div - keyup: PageUp (0)
    div - keydown: PageDown (0)
    div - keyup: PageDown (0)
  `)
})

test('presses printable characters on active element', () => {
  const {element, getEventSnapshot} = setup('<div tabindex="0"/>')
  userEvent.click(element)
  userEvent.keyPress('A')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: A (0)
    div - keypress: A (0)
    div - keyup: A (0)
  `)
})

test('presses key with alt modifier on active element', () => {
  const {element, getEventSnapshot} = setup('<div tabindex="0"/>')
  userEvent.click(element)
  userEvent.keyPress('ArrowDown', {alt: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: Alt (0)
    div - keydown: ArrowDown (0) {alt}
    div - keyup: ArrowDown (0) {alt}
    div - keyup: Alt (0)
  `)
})

test('presses key with ctrl modifier on active element', () => {
  const {element, getEventSnapshot} = setup('<div tabindex="0"/>')
  userEvent.click(element)
  userEvent.keyPress('ArrowDown', {ctrl: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: Ctrl (0)
    div - keydown: ArrowDown (0) {ctrl}
    div - keyup: ArrowDown (0) {ctrl}
    div - keyup: Ctrl (0)
  `)
})

test('presses key with meta modifier on active element', () => {
  const {element, getEventSnapshot} = setup('<div tabindex="0"/>')
  userEvent.click(element)
  userEvent.keyPress('ArrowDown', {meta: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: Meta (0)
    div - keydown: ArrowDown (0) {meta}
    div - keyup: ArrowDown (0) {meta}
    div - keyup: Meta (0)
  `)
})

test('presses key with shift modifier on active element', () => {
  const {element, getEventSnapshot} = setup('<div tabindex="0"/>')
  userEvent.click(element)
  userEvent.keyPress('ArrowDown', {shift: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: Shift (0)
    div - keydown: ArrowDown (0) {shift}
    div - keyup: ArrowDown (0) {shift}
    div - keyup: Shift (0)
  `)
})

test('presses key with all modifiers on active element', () => {
  const {element, getEventSnapshot} = setup('<div tabindex="0"/>')
  userEvent.click(element)
  userEvent.keyPress('ArrowDown', {
    alt: true,
    ctrl: true,
    meta: true,
    shift: true,
  })
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: Alt (0)
    div - keydown: Ctrl (0)
    div - keydown: Meta (0)
    div - keydown: Shift (0)
    div - keydown: ArrowDown (0) {alt}{shift}{meta}{ctrl}
    div - keyup: ArrowDown (0) {alt}{shift}{meta}{ctrl}
    div - keyup: Shift (0)
    div - keyup: Meta (0)
    div - keyup: Ctrl (0)
    div - keyup: Alt (0)
  `)
})
