import {createFileList} from '#src/utils'

test('implement FileList', () => {
  const file = new File(['hello'], 'hello.png', {type: 'image/png'})
  const list = createFileList(window, [file])

  expect(list).toBeInstanceOf(FileList)
  expect(list).toHaveLength(1)
  expect(list.item(0)).toBe(file)
  expect(list[0]).toBe(file)
  expect(Array.from(list)).toEqual([file])
})
