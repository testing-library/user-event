// FileList can not be created per constructor.

export function createFileList(files: File[]): FileList {
  const list: FileList & Iterable<File> = {
    ...files,
    length: files.length,
    item: (index: number) => list[index],
    [Symbol.iterator]: function* nextFile() {
      for (let i = 0; i < list.length; i++) {
        yield list[i]
      }
    },
  }
  list.constructor = FileList
  Object.setPrototypeOf(list, FileList.prototype)
  Object.freeze(list)

  return list
}
