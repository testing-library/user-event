import userEvent from '#src'
import {setup, addListeners} from '#testHelpers/utils'

test('should fire the correct events for input', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const {element, getEventSnapshot} = setup('<input type="file" />')

  await userEvent.upload(element, file)

  // NOTE: A known limitation is that it's impossible to set the
  // value of the input programmatically. The value in the browser
  // set by a user would be: `C:\\fakepath\\${file.name}`
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - blur
    input[value=""] - focusout
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - input
    input[value=""] - change
  `)
})

test('should fire the correct events with label', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})

  const {element, getEventSnapshot} = setup(`
    <form>
      <label for="element">Element</label>
      <input type="file" id="element" />
    </form>
  `)

  await userEvent.upload(
    element.querySelector('label') as HTMLLabelElement,
    file,
  )

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: form

    label[for="element"] - pointerover
    label[for="element"] - mouseover
    label[for="element"] - pointermove
    label[for="element"] - mousemove
    label[for="element"] - pointerdown
    label[for="element"] - mousedown: primary
    label[for="element"] - pointerup
    label[for="element"] - mouseup: primary
    label[for="element"] - click: primary
    input#element[value=""] - click: primary
    input#element[value=""] - focusin
    input#element[value=""] - input
    input#element[value=""] - change
  `)
})

test('should upload the file', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const {element} = setup<HTMLInputElement>('<input type="file" />')

  await userEvent.upload(element, file)

  expect(element.files?.[0]).toStrictEqual(file)
  expect(element.files?.item(0)).toStrictEqual(file)
  expect(element.files).toHaveLength(1)
})

test('should upload multiple files', async () => {
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]
  const {element} = setup<HTMLInputElement>('<input type="file" multiple />')

  await userEvent.upload(element, files)

  expect(element.files?.[0]).toStrictEqual(files[0])
  expect(element.files?.item(0)).toStrictEqual(files[0])
  expect(element.files?.[1]).toStrictEqual(files[1])
  expect(element.files?.item(1)).toStrictEqual(files[1])
  expect(element.files).toHaveLength(2)
})

test('should upload multiple files when firing on the label', async () => {
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]
  const {element} = setup(`
    <div>
      <label for="files">files</label>
      <input id="files" type="file" multiple />
    </div>
  `)

  const label = element.children[0] as HTMLLabelElement
  const input = element.children[1] as HTMLInputElement

  await userEvent.upload(label, files)

  expect(input.files?.[0]).toStrictEqual(files[0])
  expect(input.files?.item(0)).toStrictEqual(files[0])
  expect(input.files?.[1]).toStrictEqual(files[1])
  expect(input.files?.item(1)).toStrictEqual(files[1])
  expect(input.files).toHaveLength(2)
})

test('should not upload when is disabled', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const {element} = setup<HTMLInputElement>('<input type="file" disabled />')

  await userEvent.upload(element, file)

  expect(element.files?.[0]).toBeUndefined()
  expect(element.files?.item(0)).toBeNull()
  expect(element.files).toHaveLength(0)
})

test('should call onChange/input bubbling up the event when a file is selected', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})

  const {element: form} = setup(`
    <form>
      <input type="file" />
    </form>
  `)
  const input = form.querySelector('input') as HTMLInputElement

  const onChangeInput = jest.fn()
  const onChangeForm = jest.fn()
  const onInputInput = jest.fn()
  const onInputForm = jest.fn()
  addListeners(input, {
    eventHandlers: {change: onChangeInput, input: onInputInput},
  })
  addListeners(form, {
    eventHandlers: {change: onChangeForm, input: onInputForm},
  })

  expect(onChangeInput).toHaveBeenCalledTimes(0)
  expect(onChangeForm).toHaveBeenCalledTimes(0)
  expect(onInputInput).toHaveBeenCalledTimes(0)
  expect(onInputForm).toHaveBeenCalledTimes(0)

  await userEvent.upload(input, file)

  expect(onChangeForm).toHaveBeenCalledTimes(1)
  expect(onChangeInput).toHaveBeenCalledTimes(1)
  expect(onInputInput).toHaveBeenCalledTimes(1)
  expect(onInputForm).toHaveBeenCalledTimes(1)
})

test.each([
  [true, 'video/*,audio/*', 2],
  [true, '.png', 1],
  [true, 'text/csv', 1],
  [true, '', 4],
  [false, 'video/*', 4],
])(
  'should filter according to accept attribute applyAccept=%s, acceptAttribute=%s',
  async (applyAccept, acceptAttribute, expectedLength) => {
    const files = [
      new File(['hello'], 'hello.png', {type: 'image/png'}),
      new File(['there'], 'there.jpg', {type: 'audio/mp3'}),
      new File(['there'], 'there.csv', {type: 'text/csv'}),
      new File(['there'], 'there.jpg', {type: 'video/mp4'}),
    ]
    const {element} = setup<HTMLInputElement>(`
    <input
      type="file"
      accept="${acceptAttribute}" multiple
    />
  `)

    await userEvent.upload(element, files, undefined, {applyAccept})

    expect(element.files).toHaveLength(expectedLength)
  },
)

test('should not trigger input event when selected files are the same', async () => {
  const {element, eventWasFired, clearEventCalls} = setup<HTMLInputElement>(
    '<input type="file" multiple/>',
  )
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]

  await userEvent.upload(element, [])
  expect(eventWasFired('input')).toBe(false)
  expect(element.files).toHaveLength(0)

  await userEvent.upload(element, files)
  expect(eventWasFired('input')).toBe(true)
  expect(element.files).toHaveLength(2)

  clearEventCalls()

  await userEvent.upload(element, files)
  expect(eventWasFired('input')).toBe(false)
  expect(element.files).toHaveLength(2)

  await userEvent.upload(element, [])
  expect(eventWasFired('input')).toBe(true)
  expect(element.files).toHaveLength(0)
})

test('input.files implements iterable', async () => {
  const {element, getEvents} = setup<HTMLInputElement>(
    `<input type="file" multiple/>`,
  )
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]

  await userEvent.upload(element, files)
  const eventTargetFiles = (getEvents('input')[0].target as HTMLInputElement)
    .files

  expect(eventTargetFiles).toBe(element.files)
  expect(eventTargetFiles).not.toEqual(files)

  expect(eventTargetFiles && Array.from(eventTargetFiles)).toEqual(files)
})

test('throw error if trying to use upload on an invalid element', async () => {
  const {elements} = setup('<div></div><label><input type="checkbox"/></label>')

  await expect(
    userEvent.upload(elements[0], new File([], '')),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `The given DIV element does not accept file uploads`,
  )

  await expect(
    userEvent.upload(elements[1], new File([], '')),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `The associated INPUT element does not accept file uploads`,
  )
})

test('apply init options', async () => {
  const {element, getEvents} = setup('<input type="file"/>')

  await userEvent.upload(element, new File([], 'hello.png'), {
    changeInit: {cancelable: true},
  })

  expect(getEvents('click')[0]).toHaveProperty('shiftKey', false)
  expect(getEvents('change')[0]).toHaveProperty('cancelable', true)
})
