// FileList can not be created per constructor.

export function createFileList(files: File[]): FileList {
  const f = [...files]

  Object.setPrototypeOf(f, FileList.prototype)

  return f as unknown as FileList
}
