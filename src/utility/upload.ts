import {
  blur,
  createFileList,
  focus,
  isDisabled,
  isElementType,
  setFiles,
} from '../utils'
import {Config, Instance} from '../setup'
import {dispatchUIEvent} from '../document'

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

  await this.click(element)

  const files = (Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles])
    .filter(
      file => !this[Config].applyAccept || isAcceptableFile(file, input.accept),
    )
    .slice(0, input.multiple ? undefined : 1)

  // blur fires when the file selector pops up
  blur(input)
  // focus fires when they make their selection
  focus(input)

  // do not fire an input event if the file selection does not change
  if (
    files.length === input.files?.length &&
    files.every((f, i) => f === input.files?.item(i))
  ) {
    return
  }

  setFiles(input, createFileList(files))
  dispatchUIEvent(input, 'input')
  dispatchUIEvent(input, 'change')
}

function isAcceptableFile(file: File, accept: string) {
  if (!accept) {
    return true
  }

  const wildcards = ['audio/*', 'image/*', 'video/*']

  return accept.split(',').some(acceptToken => {
    if (acceptToken.startsWith('.')) {
      // tokens starting with a dot represent a file extension
      return file.name.endsWith(acceptToken)
    } else if (wildcards.includes(acceptToken)) {
      return file.type.startsWith(acceptToken.substr(0, acceptToken.length - 1))
    }
    return file.type === acceptToken
  })
}
