import {setup} from '#testHelpers'

test('type into input', async () => {
  const {element, getEventSnapshot, user} = setup('<input value="foo"/>', {
    focus: false,
  })

  await user.type(element, 'bar')

  expect(element).toHaveValue('foobar')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="foobar"]

    input[value="foo"] - pointerover
    input[value="foo"] - pointerenter
    input[value="foo"] - mouseover
    input[value="foo"] - mouseenter
    input[value="foo"] - pointermove
    input[value="foo"] - mousemove
    input[value="foo"] - pointerdown
    input[value="foo"] - mousedown: primary
    input[value="foo"] - focus
    input[value="foo"] - focusin
    input[value="foo"] - select
    input[value="foo"] - pointerup
    input[value="foo"] - mouseup: primary
    input[value="foo"] - click: primary
    input[value="foo"] - keydown: b
    input[value="foo"] - keypress: b
    input[value="foo"] - beforeinput
    input[value="foob"] - input
    input[value="foob"] - keyup: b
    input[value="foob"] - keydown: a
    input[value="foob"] - keypress: a
    input[value="foob"] - beforeinput
    input[value="fooba"] - input
    input[value="fooba"] - keyup: a
    input[value="fooba"] - keydown: r
    input[value="fooba"] - keypress: r
    input[value="fooba"] - beforeinput
    input[value="foobar"] - input
    input[value="foobar"] - keyup: r
  `)
})

test('can skip the initial click', async () => {
  const {element, getEvents, user} = setup('<input value="foo"/>')

  await user.type(element, 'bar', {skipClick: true})

  expect(getEvents('click')).toHaveLength(0)
  expect(element).toHaveValue('barfoo')
})

test('type with initialSelection', async () => {
  const {element, user} = setup<HTMLTextAreaElement>(
    '<textarea>Hello World</textarea>',
  )

  await user.type(element, 'Frien', {
    initialSelectionStart: 6,
    initialSelectionEnd: 10,
  })

  expect(element).toHaveValue('Hello Friend')
})

describe('automatically release pressed keys', () => {
  test('release keys', async () => {
    const {element, getEvents, user} = setup('<input />')

    await user.type(element, '{meta>}{alt>}{control>}a{/alt}')

    expect(getEvents('keyup')).toHaveLength(4)
  })

  test('skipAutoClose', async () => {
    const {element, getEvents, user} = setup('<input />')

    await user.type(element, '{meta>}a', {skipAutoClose: true})

    expect(getEvents('keyup')).toHaveLength(1)
  })
})

test('do nothing on disabled element', async () => {
  const {element, getEvents, user} = setup('<input disabled/>')

  await user.type(element, 'foo')

  expect(getEvents()).toHaveLength(0)
})
