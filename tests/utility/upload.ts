import {setup} from '#testHelpers'

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
    input[value=""] - focus: ← null
    input[value=""] - focusin: ← null
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - blur: → null
    input[value=""] - focusout: → null
    input[value="C:\\\\fakepath\\\\hello.png"] - input
    input[value="C:\\\\fakepath\\\\hello.png"] - change
    input[value="C:\\\\fakepath\\\\hello.png"] - focus: ← null
    input[value="C:\\\\fakepath\\\\hello.png"] - focusin: ← null
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
    Events fired on: label[for="element"],input#element[value="C:\\\\fakepath\\\\hello.png"]

    label[for="element"] - pointerover
    label[for="element"] - pointerenter
    label[for="element"] - mouseover
    label[for="element"] - mouseenter
    label[for="element"] - pointermove
    label[for="element"] - mousemove
    label[for="element"] - pointerdown
    label[for="element"] - mousedown: primary
    label[for="element"] - pointerup
    label[for="element"] - mouseup: primary
    label[for="element"] - click: primary
    input#element[value=""] - focus: ← null
    input#element[value=""] - focusin: ← null
    input#element[value=""] - click: primary
    input#element[value=""] - blur: → null
    input#element[value=""] - focusout: → null
    input#element[value="C:\\\\fakepath\\\\hello.png"] - input
    input#element[value="C:\\\\fakepath\\\\hello.png"] - change
    input#element[value="C:\\\\fakepath\\\\hello.png"] - focus: ← null
    input#element[value="C:\\\\fakepath\\\\hello.png"] - focusin: ← null
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
  [true, 'video/*,audio/*', ['audio.mp3', 'mp3.jpg', 'video.mp4']],
  [
    true,
    'image/png, image/gif, image/jpeg',
    ['image.png', 'image.jpeg', 'image.jpg'],
  ],
  [
    true,
    `image/jpeg,
  image/png, image/gif`,
    ['image.png', 'image.jpeg', 'image.jpg'],
  ],
  [true, 'image/JPG', ['image.jpeg', 'image.jpg']],
  [true, '.JPEG', ['image.jpeg', 'image.jpg', 'mp3.jpg']],
  [true, '.png', ['image.png']],
  [true, 'text/csv', ['file.csv']],
  [
    true,
    '',
    [
      'image.png',
      'image.jpeg',
      'image.jpg',
      'audio.mp3',
      'mp3.jpg',
      'file.csv',
      'video.mp4',
    ],
  ],
  [
    false,
    'video/*',
    [
      'image.png',
      'image.jpeg',
      'image.jpg',
      'audio.mp3',
      'mp3.jpg',
      'file.csv',
      'video.mp4',
    ],
  ],
])(
  'filter according to accept attribute applyAccept=%s, acceptAttribute=%s',
  async (applyAccept, acceptAttribute, expectedFileNames) => {
    const files = [
      new File(['hello'], 'image.png', {type: 'image/png'}),
      new File(['hello'], 'image.jpeg', {type: 'image/jpeg'}),
      new File(['hello'], 'image.jpg', {type: 'image/jpeg'}),
      new File(['hello'], 'audio.mp3', {type: 'audio/mp3'}),
      new File(['hello'], 'mp3.jpg', {type: 'audio/mp3'}),
      new File(['hello'], 'file.csv', {type: 'text/csv'}),
      new File(['hello'], 'video.mp4', {type: 'video/mp4'}),
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
    expect(
      Array.from(element.files as FileList).map(item => item.name),
    ).toEqual(expectedFileNames)
  },
)

test.each([true, false])(
  'throw if no files are accepted, multiple=%s',
  async multiple => {
    const files = [
      new File(['hello'], 'hello.png', {type: 'image/png'}),
      new File(['hello'], 'hello.jpeg', {type: 'image/jpg'}),
    ]
    const {element, user} = setup<HTMLInputElement>(
      `<input type="file" accept="video/*" ${multiple ? 'multiple' : ''} />`,
    )
    await expect(async () => {
      await user.upload(element, multiple ? files : files[0])
    }).rejects.toThrowError('No files were accepted by the `accept` attribute')
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
