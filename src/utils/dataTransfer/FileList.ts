// FileList can not be created per constructor.

export function createFileList(
  window: Window & typeof globalThis,
  files: File[],
): FileList {
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
  list.constructor = window.FileList

  // guard for environments without FileList
  /* istanbul ignore else */
  if (window.FileList as Function | undefined) {
    Object.setPrototypeOf(list, window.FileList.prototype)
  }

  Object.freeze(list)

  return list
}
