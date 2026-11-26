import {setup} from '#testHelpers'

test('change the selected option with the arrow keys', async () => {
  const {element, user, getEventSnapshot} = setup<HTMLSelectElement>(`
    <select>
      <option>Baseball</option>
      <option disabled>Basketball</option>
      <optgroup label="Unavailable" disabled>
        <option>Hockey</option>
      </optgroup>
      <option>Football</option>
    </select>
  `)

  await user.keyboard('{ArrowDown}{ArrowUp}')

  expect(element).toHaveFocus()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: select[value="Baseball"]

    select[value="Baseball"] - keydown: ArrowDown
    select[value="Football"] - input
    select[value="Football"] - change
    select[value="Football"] - keyup: ArrowDown
    select[value="Football"] - keydown: ArrowUp
    select[value="Baseball"] - input
    select[value="Baseball"] - change
    select[value="Baseball"] - keyup: ArrowUp
  `)
})

test('skip options hidden individually or by their group', async () => {
  const {element, user} = setup<HTMLSelectElement>(`
    <select>
      <option value="same">First</option>
      <option hidden>Hidden</option>
      <optgroup label="Hidden group" style="display: none"><option>Hidden too</option></optgroup>
      <option value="same">Last</option>
    </select>
  `)

  await user.keyboard('{ArrowDown}')

  expect(element.selectedIndex).toBe(3)
})

test('an option with hidden visibility can still be selected', async () => {
  const {element, user} = setup<HTMLSelectElement>(
    '<select><option>A</option><option style="visibility: hidden">B</option></select>',
  )

  await user.keyboard('{ArrowDown}')

  expect(element).toHaveValue('B')
})

test('stop at either end without dispatching extra events', async () => {
  const {element, user, getEvents} = setup<HTMLSelectElement>(
    '<select><option>A</option><option>B</option><option disabled>C</option></select>',
  )

  await user.keyboard('{ArrowUp}{ArrowDown}{ArrowDown}')

  expect(element).toHaveValue('B')
  expect(getEvents('input')).toHaveLength(1)
  expect(getEvents('change')).toHaveLength(1)
})

test('navigate forward from a select with no selected option', async () => {
  const {element, user, getEvents} = setup<HTMLSelectElement>(
    '<select><option disabled>A</option><option>B</option></select>',
  )
  element.selectedIndex = -1

  await user.keyboard('{ArrowUp}')

  expect(element.selectedIndex).toBe(-1)
  expect(getEvents('change')).toHaveLength(0)

  await user.keyboard('{ArrowDown}')

  expect(element.selectedIndex).toBe(1)
  expect(getEvents('change')).toHaveLength(1)
})

test('a canceled keydown keeps the selected option', async () => {
  const {element, user, getEvents} = setup<HTMLSelectElement>(
    '<select><option>A</option><option>B</option></select>',
    {eventHandlers: {keydown: event => event.preventDefault()}},
  )

  await user.keyboard('{ArrowDown}')

  expect(element).toHaveValue('A')
  expect(getEvents('input')).toHaveLength(0)
  expect(getEvents('change')).toHaveLength(0)
})

test.each([[''], ['<option disabled>A</option>']])(
  'keep an empty selection when no option can be selected: %s',
  async options => {
    const {element, user, getEvents} = setup<HTMLSelectElement>(
      `<select>${options}</select>`,
    )
    element.selectedIndex = -1

    await user.keyboard('{ArrowDown}{ArrowUp}')

    expect(element.selectedIndex).toBe(-1)
    expect(getEvents('change')).toHaveLength(0)
  },
)

test('read available options after keydown listeners run', async () => {
  const {element, user} = setup<HTMLSelectElement>(
    '<select><option>A</option><option>B</option><option>C</option></select>',
  )
  element.addEventListener('keydown', () => {
    element.options[1].disabled = true
  })

  await user.keyboard('{ArrowDown}')

  expect(element).toHaveValue('C')
})

test.each([['multiple'], ['size="3"']])(
  'leave listbox selection alone on a select with %s',
  async attribute => {
    const {element, user, getEvents} = setup<HTMLSelectElement>(
      `<select ${attribute}><option selected>A</option><option>B</option></select>`,
    )

    await user.keyboard('{ArrowDown}')

    expect(element.selectedIndex).toBe(0)
    expect(getEvents('change')).toHaveLength(0)
  },
)

test.each([['Alt'], ['Control'], ['Shift'], ['Meta']])(
  'leave selection alone when %s modifies an arrow key',
  async modifier => {
    const {element, user, getEvents} = setup<HTMLSelectElement>(
      '<select><option>A</option><option>B</option></select>',
    )

    await user.keyboard(`{${modifier}>}{ArrowDown}{/${modifier}}`)

    expect(element).toHaveValue('A')
    expect(getEvents('change')).toHaveLength(0)
  },
)
