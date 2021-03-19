import {fireEvent, createEvent} from '@testing-library/dom'
import {click} from './click'
import {blur} from './blur'
import {focus} from './focus'
import {isDisabled, isInstanceOfElement} from './utils'

interface uploadInit {
  clickInit?: MouseEventInit
  changeInit?: Event
}

interface uploadOptions {
  applyAccept?: boolean
}

function upload(
  element: HTMLInputElement | HTMLLabelElement,
  fileOrFiles: File | File[],
  init?: uploadInit,
  {applyAccept = false}: uploadOptions = {},
) {
  if (isDisabled(element)) return

  click(element, init?.clickInit)

  const input = isInstanceOfElement(element, 'HTMLLabelElement')
    ? ((element as HTMLLabelElement).control as HTMLInputElement)
    : (element as HTMLInputElement)

  const files = (Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles])
    .filter(file => !applyAccept || isAcceptableFile(file, input.accept))
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
  const inputFiles: FileList = {
    ...files,
    length: files.length,
    item: (index: number) => files[index],
  }

  fireEvent(
    input,
    createEvent('input', input, {
      target: {files: inputFiles},
      bubbles: true,
      cancelable: false,
      composed: true,
      ...init,
    }),
  )

  fireEvent.change(input, {
    target: {files: inputFiles},
    ...init,
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

export {upload}
