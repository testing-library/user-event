import {
  createFileList,
  getWindow,
  isDisabled,
  isElementType,
  setFiles,
} from '../utils'
import {type Instance} from '../setup'

export interface uploadInit {
  changeInit?: EventInit
}

export async function upload(
  this: Instance,
  element: HTMLElement,
  fileOrFiles: File | File[],
) {
  const input = isElementType(element, 'label') ? element.control : element

  if (!input || !isElementType(input, 'input', {type: 'file' as const})) {
    throw new TypeError(
      `The ${input === element ? 'given' : 'associated'} ${
        input?.tagName
      } element does not accept file uploads`,
    )
  }
  if (isDisabled(element)) return

  const selectedFiles = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
  const files = selectedFiles
    .filter(
      file => !this.config.applyAccept || isAcceptableFile(file, input.accept),
    )
    .slice(0, input.multiple ? undefined : 1)

  if (selectedFiles.length > 0 && files.length === 0) {
    throw new Error('No files were accepted by the `accept` attribute')
  }

  const fileDialog = () => {
    // do not fire an input event if the file selection does not change
    if (
      files.length === input.files?.length &&
      files.every((f, i) => f === input.files?.item(i))
    ) {
      return
    }

    setFiles(input, createFileList(getWindow(element), files))
    this.dispatchUIEvent(input, 'input')
    this.dispatchUIEvent(input, 'change')
  }

  input.addEventListener('fileDialog', fileDialog)

  await this.click(element)

  input.removeEventListener('fileDialog', fileDialog)
}

// When matching files, browsers ignore case and consider jpeg/jpg interchangeable.
function normalize(nameOrType: string) {
  return nameOrType.toLowerCase().replace(/(\.|\/)jpg\b/g, '$1jpeg')
}

function isAcceptableFile(file: File, accept: string) {
  if (!accept) {
    return true
  }

  const wildcards = ['audio/*', 'image/*', 'video/*']

  return normalize(accept)
    .trim()
    .split(/\s*,\s*/)
    .some(acceptToken => {
      // tokens starting with a dot represent a file extension
      if (acceptToken.startsWith('.')) {
        return normalize(file.name).endsWith(acceptToken)
      } else if (wildcards.includes(acceptToken)) {
        return normalize(file.type).startsWith(acceptToken.replace('*', ''))
      }
      return normalize(file.type) === acceptToken
    })
}
