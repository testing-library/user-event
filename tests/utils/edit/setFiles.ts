import {createFileList, setFiles} from '#src/utils'
import {setup} from '#testHelpers/utils'

test('set files', () => {
  const {element} = setup<HTMLInputElement & {type: 'file'}>(
    `<input type="file"/>`,
  )

  const list = createFileList([new File(['foo'], 'foo.txt')])
  setFiles(element, list)

  expect(element).toHaveProperty('files', list)
  expect(element).toHaveValue('C:\\fakepath\\foo.txt')
})

test('switching type resets value', () => {
  const {element} = setup<HTMLInputElement>(`<input type="text"/>`)

  element.type = 'file'

  expect(element).toHaveValue('')

  const list = createFileList([new File(['foo'], 'foo.txt')])
  setFiles(element as HTMLInputElement & {type: 'file'}, list)

  element.type = 'file'

  expect(element).toHaveValue('C:\\fakepath\\foo.txt')

  element.type = 'text'

  expect(element).toHaveValue('')
  expect(element).toHaveProperty('type', 'text')
})

test('setting value resets `files`', () => {
  const {element} = setup<HTMLInputElement & {type: 'file'}>(
    `<input type="file"/>`,
  )

  const list = createFileList([new File(['foo'], 'foo.txt')])
  setFiles(element, list)

  // Everything but an empty string throws an error in the browser
  expect(() => {
    element.value = 'foo'
  }).toThrow()

  expect(element).toHaveProperty('files', list)

  element.value = ''

  expect(element).toHaveProperty('files', expect.objectContaining({length: 0}))
})

test('is save to call multiple times', () => {
  const {element} = setup<HTMLInputElement & {type: 'file'}>(
    `<input type="file"/>`,
  )

  const list = createFileList([new File(['foo'], 'foo.txt')])
  setFiles(element, list)
  setFiles(element, list)

  expect(element).toHaveValue('C:\\fakepath\\foo.txt')
  element.value = ''
  expect(element).toHaveValue('')
})
