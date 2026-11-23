import {setup} from '#testHelpers'

test.each([
  ['ArrowUp', 55],
  ['ArrowDown', 45],
  ['ArrowRight', 55],
  ['ArrowLeft', 45],
] as const)('step a range input with %s', async (key, value) => {
  const {element, user} = setup<HTMLInputElement>(
    '<input type="range" value="50" step="5">',
  )

  await user.keyboard(`{${key}}`)

  expect(element.valueAsNumber).toBe(value)
})

test('dispatch range input and change after the value has changed', async () => {
  const {element, user, getEvents, getEventSnapshot} = setup(
    '<input type="range" value="4">',
  )

  await user.keyboard('{ArrowRight}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="5"]

    input[value="4"] - keydown: ArrowRight
    input[value="5"] - input
    input[value="5"] - change
    input[value="5"] - keyup: ArrowRight
  `)
  for (const type of ['input', 'change'] as const) {
    expect(getEvents(type)[0].constructor).toBe(
      element.ownerDocument.defaultView?.Event,
    )
    expect(getEvents(type)[0]).toMatchObject({
      bubbles: true,
      cancelable: false,
      composed: type === 'input',
    })
  }
})

test('respect fractional steps and stop at the range limits', async () => {
  const {element, user, getEvents} = setup<HTMLInputElement>(
    '<input type="range" min="-0.3" max="0.2" step="0.2" value="-0.1">',
  )

  await user.keyboard('{ArrowRight}{ArrowRight}')
  expect(element.valueAsNumber).toBe(0.1)

  await user.keyboard('{ArrowLeft>3/}')
  expect(element.valueAsNumber).toBe(-0.3)
  expect(getEvents('input')).toHaveLength(3)
  expect(getEvents('change')).toHaveLength(3)
})

test.each([
  ['min="20" max="45"', 40, 40.25],
  ['', 50, 51],
  ['min="0" max="1"', 0.999, 1],
  ['min="5" max="5"', 5, 5],
  ['min="20x" max="45"', 40, 40.45],
  ['min="20" max="45x"', 40, 40.8],
  ['min="999999999999900" max="1000000000000100"', 1e15, 1e15 + 2],
] as const)(
  'step with step="any" and bounds %s',
  async (bounds, start, end) => {
    const {element, user} = setup<HTMLInputElement>(
      `<input type="range" ${bounds} step="any" value="${start}">`,
    )

    await user.keyboard('{ArrowUp}')
    expect(element.valueAsNumber).toBe(end)
  },
)

test.each([
  ['direction: rtl', 'ArrowRight', 4],
  ['writing-mode: vertical-lr', 'ArrowDown', 6],
  ['writing-mode: vertical-rl; direction: rtl', 'ArrowDown', 4],
] as const)('respect %s for %s', async (style, key, value) => {
  const {element, user} = setup<HTMLInputElement>(
    `<input type="range" style="${style}" value="5">`,
  )

  await user.keyboard(`{${key}}`)

  expect(element.valueAsNumber).toBe(value)
})

test('leave the range value unchanged when keydown is canceled', async () => {
  const {element, user, getEvents} = setup<HTMLInputElement>(
    '<input type="range" value="5">',
    {eventHandlers: {keydown: e => e.preventDefault()}},
  )

  await user.keyboard('{ArrowUp}')

  expect(element.valueAsNumber).toBe(5)
  expect(getEvents().map(e => e.type)).toEqual(['keydown', 'keyup'])
})

test.each([
  ['dir="rtl"', 'ArrowLeft'],
  ['style="direction: rtl"', 'ArrowLeft'],
  ['style="writing-mode: vertical-lr"', 'ArrowDown'],
] as const)('inherit %s from an ancestor', async (attribute, key) => {
  const {user, xpathNode} = setup(
    `<div ${attribute}><input type="range" value="5"></div>`,
  )

  await user.keyboard(`{${key}}`)

  expect(xpathNode<HTMLInputElement>('div/input').valueAsNumber).toBe(6)
})

test.each(['disabled', 'type'] as const)(
  'honor a change to %s in a range keydown handler',
  async attribute => {
    const {element, user, getEvents} = setup<HTMLInputElement>(
      '<input type="range" value="5">',
    )
    element.addEventListener('keydown', () => {
      element.setAttribute(attribute, attribute === 'type' ? 'text' : '')
    })

    await user.keyboard('{ArrowUp}')

    expect(element.value).toBe('5')
    expect(getEvents('input')).toHaveLength(0)
    expect(getEvents('change')).toHaveLength(0)
  },
)
