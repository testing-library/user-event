import {render, setup} from '#testHelpers'
import userEvent from '#src'

test('change file input', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const {element, getEventSnapshot, user} = setup<HTMLInputElement>(
    '<input type="file" />',
    {focus: false},
  )

  await user.upload(element, file)

  expect(element.files?.[0]).toStrictEqual(file)
  expect(element.files?.item(0)).toStrictEqual(file)
  expect(element.files).toHaveLength(1)

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="C:\\\\fakepath\\\\hello.png"]

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
    input[value="C:\\\\fakepath\\\\hello.png"] - input
    input[value="C:\\\\fakepath\\\\hello.png"] - change
    input[value="C:\\\\fakepath\\\\hello.png"] - focus
    input[value="C:\\\\fakepath\\\\hello.png"] - focusin
  `)
})

test('relay click/upload on label to file input', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})

  const {
    elements: [label],
    getEventSnapshot,
    user,
  } = setup<[HTMLLabelElement]>(
    `
    <label for="element">Element</label>
    <input type="file" id="element" />
  `,
    {focus: false},
  )

  await user.upload(label, file)

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    label[for="element"] - pointerover
    div - pointerenter
    label[for="element"] - mouseover
    div - mouseenter
    label[for="element"] - pointermove
    label[for="element"] - mousemove
    label[for="element"] - pointerdown
    label[for="element"] - mousedown: primary
    label[for="element"] - pointerup
    label[for="element"] - mouseup: primary
    label[for="element"] - click: primary
    input#element[value=""] - focusin
    input#element[value=""] - click: primary
    input#element[value=""] - focusout
    input#element[value="C:\\\\fakepath\\\\hello.png"] - input
    input#element[value="C:\\\\fakepath\\\\hello.png"] - change
    input#element[value="C:\\\\fakepath\\\\hello.png"] - focusin
  `)
})

test('prevent file dialog per click event handler', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})

  const {
    elements: [label, input],
    eventWasFired,
    user,
  } = setup<[HTMLLabelElement]>(`
        <label for="element">Element</label>
        <input type="file" id="element" />
    `)
  input.addEventListener('click', e => e.preventDefault())

  await user.upload(label, file)

  expect(eventWasFired('input')).toBe(false)
})

test('upload multiple files', async () => {
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]
  const {element, user} = setup<HTMLInputElement>(
    '<input type="file" multiple />',
  )

  await user.upload(element, files)

  expect(element.files?.[0]).toStrictEqual(files[0])
  expect(element.files?.item(0)).toStrictEqual(files[0])
  expect(element.files?.[1]).toStrictEqual(files[1])
  expect(element.files?.item(1)).toStrictEqual(files[1])
  expect(element.files).toHaveLength(2)
})

test('upload multiple files per label', async () => {
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]
  const {
    elements: [label, input],
    user,
  } = setup<[HTMLLabelElement, HTMLInputElement]>(`
    <label for="files">files</label>
    <input id="files" type="file" multiple />
  `)

  await user.upload(label, files)

  expect(input.files?.[0]).toStrictEqual(files[0])
  expect(input.files?.item(0)).toStrictEqual(files[0])
  expect(input.files?.[1]).toStrictEqual(files[1])
  expect(input.files?.item(1)).toStrictEqual(files[1])
  expect(input.files).toHaveLength(2)
})

// TODO: should this throw?
test('do nothing when element is disabled', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const {element, user} = setup<HTMLInputElement>(
    '<input type="file" disabled />',
  )

  await user.upload(element, file)

  expect(element.files?.[0]).toBeUndefined()
  expect(element.files?.item(0)).toBeNull()
  expect(element.files).toHaveLength(0)
})

test.each([
  [true, 'video/*,audio/*', 2],
  [true, '.png', 1],
  [true, 'text/csv', 1],
  [true, '', 4],
  [false, 'video/*', 4],
])(
  'filter according to accept attribute applyAccept=%s, acceptAttribute=%s',
  async (applyAccept, acceptAttribute, expectedLength) => {
    const files = [
      new File(['hello'], 'hello.png', {type: 'image/png'}),
      new File(['there'], 'there.jpg', {type: 'audio/mp3'}),
      new File(['there'], 'there.csv', {type: 'text/csv'}),
      new File(['there'], 'there.jpg', {type: 'video/mp4'}),
    ]
    const {element, user} = setup<HTMLInputElement>(
      `
    <input
      type="file"
      accept="${acceptAttribute}" multiple
    />
  `,
      {applyAccept},
    )

    await user.upload(element, files)

    expect(element.files).toHaveLength(expectedLength)
  },
)

test('do not trigger input event when selected files are the same', async () => {
  const {element, eventWasFired, clearEventCalls, user} =
    setup<HTMLInputElement>('<input type="file" multiple/>')
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]

  await user.upload(element, [])
  expect(eventWasFired('input')).toBe(false)
  expect(element.files).toHaveLength(0)

  await user.upload(element, files)
  expect(eventWasFired('input')).toBe(true)
  expect(element.files).toHaveLength(2)

  clearEventCalls()

  await user.upload(element, files)
  expect(eventWasFired('input')).toBe(false)
  expect(element.files).toHaveLength(2)

  await user.upload(element, [])
  expect(eventWasFired('input')).toBe(true)
  expect(element.files).toHaveLength(0)
})

test('throw error if trying to use upload on an invalid element', async () => {
  const {elements, user} = setup(
    '<div></div><label><input type="checkbox"/></label>',
  )

  await expect(
    user.upload(elements[0], new File([], '')),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `The given DIV element does not accept file uploads`,
  )

  await expect(
    user.upload(elements[1], new File([], '')),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `The associated INPUT element does not accept file uploads`,
  )
})

test('uploaded file can be read with FormData', async () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const {element: form} = render<HTMLFormElement>(
    '<form><input name="file" type="file" /></form>',
  )

  const input = form.querySelector('input') as HTMLInputElement

  await userEvent.upload(input, file)

  const data = new FormData(form)

  const formFile = data.get('file')
  if (!(formFile instanceof File)) {
    throw new Error('formFile is not a File')
  }

  expect(formFile).toBeInstanceOf(File)
  expect(formFile.name).toBe('hello.png')
  expect(formFile).toBe(input.files?.[0])
})
