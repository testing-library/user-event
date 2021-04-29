import userEvent from '../'
import {setup, addListeners} from './helpers/utils'

test('should fire the correct events for input', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const {element, getEventSnapshot} = setup('<input type="file" />')

  userEvent.upload(element, file)

  // NOTE: A known limitation is that it's impossible to set the
  // value of the input programmatically. The value in the browser
  // set by a user would be: `C:\\fakepath\\${file.name}`
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - blur
    input[value=""] - focusout
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - input
    input[value=""] - change
  `)
})

test('should fire the correct events with label', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})

  const {element, getEventSnapshot} = setup(`
    <form>
      <label for="element">Element</label>
      <input type="file" id="element" />
    </form>
  `)

  userEvent.upload(element.querySelector('label'), file)

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: form

    label[for="element"] - pointerover
    form - pointerenter
    label[for="element"] - mouseover: Left (0)
    form - mouseenter: Left (0)
    label[for="element"] - pointermove
    label[for="element"] - mousemove: Left (0)
    label[for="element"] - pointerdown
    label[for="element"] - mousedown: Left (0)
    label[for="element"] - pointerup
    label[for="element"] - mouseup: Left (0)
    label[for="element"] - click: Left (0)
    input#element[value=""] - click: Left (0)
    input#element[value=""] - focusin
    input#element[value=""] - input
    input#element[value=""] - change
  `)
})

test('should upload the file', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const {element} = setup('<input type="file" />')

  userEvent.upload(element, file)

  expect(element.files[0]).toStrictEqual(file)
  expect(element.files.item(0)).toStrictEqual(file)
  expect(element.files).toHaveLength(1)
})

test('should upload multiple files', () => {
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]
  const {element} = setup('<input type="file" multiple />')

  userEvent.upload(element, files)

  expect(element.files[0]).toStrictEqual(files[0])
  expect(element.files.item(0)).toStrictEqual(files[0])
  expect(element.files[1]).toStrictEqual(files[1])
  expect(element.files.item(1)).toStrictEqual(files[1])
  expect(element.files).toHaveLength(2)
})

test('should upload multiple files when firing on the label', () => {
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

  const label = element.children[0]
  const input = element.children[1]

  userEvent.upload(label, files)

  expect(input.files[0]).toStrictEqual(files[0])
  expect(input.files.item(0)).toStrictEqual(files[0])
  expect(input.files[1]).toStrictEqual(files[1])
  expect(input.files.item(1)).toStrictEqual(files[1])
  expect(input.files).toHaveLength(2)
})

test('should not upload when is disabled', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const {element} = setup('<input type="file" disabled />')

  userEvent.upload(element, file)

  expect(element.files[0]).toBeUndefined()
  expect(element.files.item(0)).toBeNull()
  expect(element.files).toHaveLength(0)
})

test('should call onChange/input bubbling up the event when a file is selected', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})

  const {element: form} = setup(`
    <form>
      <input type="file" />
    </form>
  `)
  const input = form.querySelector('input')

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

  userEvent.upload(input, file)

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
  (applyAccept, acceptAttribute, expectedLength) => {
    const files = [
      new File(['hello'], 'hello.png', {type: 'image/png'}),
      new File(['there'], 'there.jpg', {type: 'audio/mp3'}),
      new File(['there'], 'there.csv', {type: 'text/csv'}),
      new File(['there'], 'there.jpg', {type: 'video/mp4'}),
    ]
    const {element} = setup(`
    <input
      type="file"
      accept="${acceptAttribute}" multiple
    />
  `)

    userEvent.upload(element, files, undefined, {applyAccept})

    expect(element.files).toHaveLength(expectedLength)
  },
)

test('should not trigger input event when selected files are the same', () => {
  const {element, eventWasFired, clearEventCalls} = setup(
    '<input type="file" multiple/>',
  )
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]

  userEvent.upload(element, [])
  expect(eventWasFired('input')).toBe(false)
  expect(element.files).toHaveLength(0)

  userEvent.upload(element, files)
  expect(eventWasFired('input')).toBe(true)
  expect(element.files).toHaveLength(2)

  clearEventCalls()

  userEvent.upload(element, files)
  expect(eventWasFired('input')).toBe(false)
  expect(element.files).toHaveLength(2)

  userEvent.upload(element, [])
  expect(eventWasFired('input')).toBe(true)
  expect(element.files).toHaveLength(0)
})

test('input.files implements iterable', () => {
  const {element, getEvents} = setup(`<input type="file" multiple/>`)
  const files = [
    new File(['hello'], 'hello.png', {type: 'image/png'}),
    new File(['there'], 'there.png', {type: 'image/png'}),
  ]

  userEvent.upload(element, files)
  const eventTargetFiles = getEvents('input')[0].target.files

  expect(eventTargetFiles).toBe(element.files)
  expect(eventTargetFiles).not.toEqual(files)

  expect(Array.from(eventTargetFiles)).toEqual(files)
})

test('throw error if trying to use upload on an invalid element', () => {
  const {elements} = setup('<div></div><label><input type="checkbox"/></label>')

  expect(() =>
    userEvent.upload(elements[0], "I'm only a div :("),
  ).toThrowErrorMatchingInlineSnapshot(
    `"The given DIV element does not accept file uploads"`,
  )

  expect(() =>
    userEvent.upload(elements[1], "I'm a checkbox :("),
  ).toThrowErrorMatchingInlineSnapshot(
    `"The associated INPUT element does not accept file uploads"`,
  )
})

test('apply init options', () => {
  const {element, getEvents} = setup('<input type="file"/>')

  userEvent.upload(element, new File([], 'hello.png'), {
    clickInit: {shiftKey: true},
    changeInit: {cancelable: true},
  })

  expect(getEvents('click')[0]).toHaveProperty('shiftKey', true)
  expect(getEvents('change')[0]).toHaveProperty('cancelable', true)
})
