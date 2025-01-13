import {setup} from '#testHelpers'

test('click element', async () => {
  const {element, getClickEventsSnapshot, getEvents, user} = setup('<div />')
  await user.pointer({keys: '[MouseLeft]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
  expect(getEvents('click')).toHaveLength(1)
})

test('secondary button triggers contextmenu', async () => {
  const {element, getClickEventsSnapshot, getEvents, user} = setup('<div />')
  await user.pointer({keys: '[MouseRight>]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=2; buttons=2; detail=1
    contextmenu - button=2; buttons=2; detail=0
  `)
  expect(getEvents('contextmenu')).toHaveLength(1)
})

test('double click', async () => {
  const {element, getClickEventsSnapshot, getEvents, user} =
    setup(`<div></div>`)

  await user.pointer({keys: '[MouseLeft][MouseLeft]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=2
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick - button=0; buttons=0; detail=2
  `)

  expect(getEvents('dblclick')).toHaveLength(1)
  expect(getEvents('click')).toHaveLength(2)

  // detail reflects the click count
  expect(getEvents('mousedown')[1]).toHaveProperty('detail', 2)
  expect(getEvents('dblclick')[0]).toHaveProperty('detail', 2)
})

test('two clicks', async () => {
  const {element, getClickEventsSnapshot, getEvents, user} =
    setup(`<div></div>`)

  await user.pointer({
    keys: '[MouseLeft]',
    target: element,
  })
  await user.pointer({keys: '[MouseLeft]'})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)

  expect(getEvents('dblclick')).toHaveLength(0)
  expect(getEvents('click')).toHaveLength(2)

  expect(getEvents('mousedown')[1]).toHaveProperty('detail', 1)
})

test('other keys reset click counter', async () => {
  const {element, getClickEventsSnapshot, getEvents, user} =
    setup(`<div></div>`)

  await user.pointer({
    keys: '[MouseLeft][MouseLeft>][MouseRight][MouseLeft]',
    target: element,
  })

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=2
    mousedown - button=2; buttons=3; detail=1
    contextmenu - button=2; buttons=3; detail=0
    mouseup - button=2; buttons=1; detail=1
    auxclick - button=2; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=0
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)

  expect(getEvents('mouseup')[2]).toHaveProperty('detail', 0)
  expect(getEvents('mousedown')[3]).toHaveProperty('detail', 1)
})

test('click per touch device', async () => {
  const {element, getClickEventsSnapshot, getEvents, user} =
    setup(`<div></div>`)

  await user.pointer({keys: '[TouchA]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=true
    pointerenter - pointerId=2; pointerType=touch; isPrimary=true
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=true
    pointerleave - pointerId=2; pointerType=touch; isPrimary=true
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=1; detail=1
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)

  // mouse is pointerId=1, every other pointer gets a new id
  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('pointerId', 2)
})

test('double click per touch device', async () => {
  const {element, getClickEventsSnapshot, getEvents, user} =
    setup(`<div></div>`)

  await user.pointer({keys: '[TouchA][TouchA]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=true
    pointerenter - pointerId=2; pointerType=touch; isPrimary=true
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=true
    pointerleave - pointerId=2; pointerType=touch; isPrimary=true
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=1; detail=1
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerover - pointerId=3; pointerType=touch; isPrimary=true
    pointerenter - pointerId=3; pointerType=touch; isPrimary=true
    pointerdown - pointerId=3; pointerType=touch; isPrimary=true
    pointerup - pointerId=3; pointerType=touch; isPrimary=true
    pointerout - pointerId=3; pointerType=touch; isPrimary=true
    pointerleave - pointerId=3; pointerType=touch; isPrimary=true
    mousedown - button=0; buttons=1; detail=2
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick - button=0; buttons=0; detail=2
  `)

  // mouse is pointerId=1, every other pointer gets a new id
  expect(getEvents('click')).toHaveLength(2)
  expect(getEvents('click')[0]).toHaveProperty('pointerId', 2)
  expect(getEvents('click')[1]).toHaveProperty('pointerId', 3)
  expect(getEvents('dblclick')).toHaveLength(1)
  expect(getEvents('dblclick')[0]).not.toHaveProperty('pointerId')
})

test('multi touch does not click', async () => {
  const {element, getEvents, user} = setup(`<div></div>`)

  await user.pointer({keys: '[TouchA>][TouchB][/TouchA]', target: element})

  expect(getEvents('click')).toHaveLength(0)
})

describe('label', () => {
  test('click associated control per label', async () => {
    const {element, getEvents, user} = setup(
      `<label for="in">foo</label><input id="in"/>`,
    )

    await user.pointer({keys: '[MouseLeft]', target: element})

    expect(getEvents('click')).toHaveLength(2)
  })

  test('click nested control per label', async () => {
    const {element, getEvents, user} = setup(`<label><input/></label>`)

    await user.pointer({keys: '[MouseLeft]', target: element})

    expect(getEvents('click')).toHaveLength(2)
  })

  test('click nested select per label', async () => {
    const {element, getEvents, user} = setup(`<label><select/></label>`)

    await user.pointer({keys: '[MouseLeft]', target: element})

    expect(getEvents('click')).toHaveLength(2)
  })

  // TODO: enable as soon as jsdom properly supports CEs
  test.skip('click nested FACE per label', async () => {
    const {elements, getEvents, user} = setup(`
      <script>
        class FaCe extends HTMLElement {
          static formAssociated = true;
        }
        customElements.define("fa-ce", FaCe);
      </script>
      <label>
        <fa-ce></fa-ce>
      </label>
    `)

    await user.pointer({
      keys: '[MouseLeft]',
      target: Array.from(elements).at(-1),
    })

    expect(getEvents('click')).toHaveLength(2)
  })
})

describe('check/uncheck control per click', () => {
  test('clicking changes checkbox', async () => {
    const {element, user} = setup('<input type="checkbox" />')

    await user.pointer({keys: '[MouseLeft]', target: element})

    expect(element).toBeChecked()

    await user.pointer({keys: '[MouseLeft]', target: element})

    expect(element).not.toBeChecked()
  })

  test('clicking changes radio button', async () => {
    const {
      elements: [radioA, radioB],
      user,
    } = setup(`
      <input type="radio" name="foo"/>
      <input type="radio" name="foo"/>
    `)

    await user.pointer({keys: '[MouseLeft]', target: radioA})

    expect(radioA).toBeChecked()

    await user.pointer({keys: '[MouseLeft]', target: radioB})

    expect(radioA).not.toBeChecked()
  })

  test('clicking label changes checkable input', async () => {
    const {
      elements: [input, label],
      user,
    } = setup(`<input type="checkbox" id="a"/><label for="a"></label>`)

    await user.pointer({keys: '[MouseLeft]', target: label})

    expect(input).toBeChecked()

    await user.pointer({keys: '[MouseLeft]', target: label})

    expect(input).not.toBeChecked()
  })
})

describe('submit form per click', () => {
  test('submits a form when clicking on a <button>', async () => {
    const {element, eventWasFired, user} = setup(
      `<form><button></button></form>`,
    )

    await user.pointer({keys: '[MouseLeft]', target: element.children[0]})

    expect(eventWasFired('submit')).toBe(true)
  })

  test('does not submit a form when clicking on a <button type="button">', async () => {
    const {element, eventWasFired, user} = setup(
      `<form><button type="button"></button></form>`,
    )

    await user.pointer({keys: '[MouseLeft]', target: element.children[0]})

    expect(eventWasFired('submit')).toBe(false)
  })
})

test('secondary mouse button fires `contextmenu`', async () => {
  const {element, eventWasFired, clearEventCalls, user} = setup(`<button/>`)

  await user.pointer({keys: '[MouseLeft]', target: element})
  expect(eventWasFired('contextmenu')).toBe(false)

  clearEventCalls()
  await user.pointer({keys: '[MouseRight>]', target: element})
  expect(eventWasFired('contextmenu')).toBe(true)
})

test('non-primary mouse buttons fire `auxclick`', async () => {
  const {element, eventWasFired, getEvents, clearEventCalls, user} =
    setup(`<button/>`)

  await user.pointer({keys: '[MouseLeft]', target: element})
  expect(eventWasFired('click')).toBe(true)
  expect(eventWasFired('auxclick')).toBe(false)

  clearEventCalls()
  await user.pointer({keys: '[MouseRight]', target: element})
  expect(eventWasFired('click')).toBe(false)
  expect(eventWasFired('auxclick')).toBe(true)
  expect(getEvents('auxclick')[0]).toHaveProperty('button', 2)

  clearEventCalls()
  await user.pointer({keys: '[MouseMiddle]', target: element})
  expect(eventWasFired('click')).toBe(false)
  expect(eventWasFired('auxclick')).toBe(true)
  expect(getEvents('auxclick')[0]).toHaveProperty('button', 1)
})

test('click closest common ancestor of pointerdown/pointerup', async () => {
  const {element, getEvents, user, xpathNode, clearEventCalls} = setup(
    `<div><span>foo</span><span>bar</span></div>`,
  )

  await user.pointer([
    {keys: '[MouseLeft>]', target: xpathNode<HTMLSpanElement>('//span[1]')},
    {keys: '[/MouseLeft]', target: xpathNode<HTMLSpanElement>('//span[2]')},
  ])

  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('target', element)

  clearEventCalls()
  await user.pointer([
    {keys: '[MouseLeft>]', target: document.createElement('div')},
    {keys: '[/MouseLeft]', target: xpathNode<HTMLSpanElement>('//span[2]')},
  ])
  expect(getEvents('mouseup')).toHaveLength(1)
  expect(getEvents('click')).toHaveLength(0)
})
