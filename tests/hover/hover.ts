import userEvent from '#src'
import {addEventListener, setup} from '#testHelpers/utils'

test('hover', async () => {
  const {element, getEventSnapshot} = setup('<button />')

  await userEvent.hover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
  `)
})

test('hover on disabled element', async () => {
  const {element, getEventSnapshot} = setup('<button disabled />')

  await userEvent.hover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - pointermove
  `)
})

test('no events fired on labels that contain disabled controls', async () => {
  const {element, getEventSnapshot} = setup('<label><input disabled /></label>')

  await userEvent.hover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: label

    label - pointerover
    label - pointerenter
    label - mouseover
    label - mouseenter
    label - pointermove
    label - mousemove
  `)
})

test('fires non-bubbling events on parents for hover', async () => {
  // Doesn't use getEventSnapshot() because:
  // 1) We're asserting the events of both elements (not what bubbles to the outer div)
  // 2) We're asserting the order of these events in a single list as they're
  //     interleaved across two elements.
  const {element: div} = setup('<div><button></button></div>')
  const button = div.firstChild as HTMLButtonElement

  const calls: string[] = []
  function addListeners(el: Element) {
    for (const event of [
      'mouseenter',
      'mouseover',
      'mouseleave',
      'mouseout',
      'pointerenter',
      'pointerover',
      'pointerleave',
      'pointerout',
    ]) {
      addEventListener(el, event, () => {
        calls.push(`${el.tagName}: ${event}`)
      })
    }
  }
  addListeners(div)
  addListeners(button)

  await userEvent.hover(button)

  expect(calls.join('\n')).toMatchInlineSnapshot(`
    BUTTON: pointerover
    DIV: pointerover
    BUTTON: pointerenter
    BUTTON: mouseover
    DIV: mouseover
    BUTTON: mouseenter
  `)
})

test('fires non-bubbling events on parents for unhover', async () => {
  // Doesn't use getEventSnapshot() because:
  // 1) We're asserting the events of both elements (not what bubbles to the outer div)
  // 2) We're asserting the order of these events in a single list as they're
  //     interleaved across two elements.
  const {element: div} = setup('<div><button></button></div>')
  const button = div.firstChild as HTMLButtonElement

  const calls: string[] = []
  function addListeners(el: Element) {
    for (const event of [
      'mouseenter',
      'mouseover',
      'mouseleave',
      'mouseout',
      'pointerenter',
      'pointerover',
      'pointerleave',
      'pointerout',
    ]) {
      addEventListener(el, event, () => {
        calls.push(`${el.tagName}: ${event}`)
      })
    }
  }
  addListeners(div)
  addListeners(button)

  await userEvent.unhover(button)

  expect(calls.join('\n')).toMatchInlineSnapshot(`
    BUTTON: pointerout
    DIV: pointerout
    BUTTON: pointerleave
    BUTTON: mouseout
    DIV: mouseout
    BUTTON: mouseleave
  `)
})

test('throws when hovering element with pointer-events set to none', async () => {
  const {element} = setup(`<div style="pointer-events: none"></div>`)
  await expect(userEvent.hover(element)).rejects.toThrowError(
    /unable to hover/i,
  )
})

test('does not throws when hover element with pointer-events set to none and skipPointerEventsCheck is set', async () => {
  const {element, getEventSnapshot} = setup(
    `<div style="pointer-events: none"></div>`,
  )
  await userEvent.hover(element, {skipPointerEventsCheck: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
  `)
})
