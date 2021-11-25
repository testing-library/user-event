import {fireEvent, createEvent} from '@testing-library/dom'
import {blur, focus, isDisabled, isElementType} from '../utils'
import {Config, UserEvent} from '../setup'

export interface uploadInit {
  changeInit?: EventInit
}

export async function upload(
  this: UserEvent,
  element: HTMLElement,
  fileOrFiles: File | File[],
  init?: uploadInit,
) {
  const input = isElementType(element, 'label') ? element.control : element

  if (!input || !isElementType(input, 'input', {type: 'file'})) {
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
  blur(element)
  // focus fires when they make their selection
  focus(element)

  // do not fire an input event if the file selection does not change
  if (
    files.length === input.files?.length &&
    files.every((f, i) => f === input.files?.item(i))
  ) {
    return
  }

  // the event fired in the browser isn't actually an "input" or "change" event
  // but a new Event with a type set to "input" and "change"
  // Kinda odd...
  const inputFiles: FileList & Iterable<File> = {
    ...files,
    length: files.length,
    item: (index: number) => files[index],
    [Symbol.iterator]() {
      let i = 0
      return {
        next: () => ({
          done: i >= files.length,
          value: files[i++],
        }),
      }
    },
  }

  fireEvent(
    input,
    createEvent('input', input, {
      target: {files: inputFiles},
      bubbles: true,
      cancelable: false,
      composed: true,
    }),
  )

  fireEvent.change(input, {
    target: {files: inputFiles},
    ...init?.changeInit,
  })
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
