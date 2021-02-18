import {fireEvent, createEvent} from '@testing-library/dom'
import {click} from './click'
import {blur} from './blur'
import {focus} from './focus'

function upload(element, fileOrFiles, init) {
  const hasFileWithInvalidType =
    !Array.isArray(fileOrFiles) &&
    Boolean(element.accept) &&
    !element.accept.includes(fileOrFiles.type)

  if (hasFileWithInvalidType || element.disabled) return

  click(element, init)

  const input = element.tagName === 'LABEL' ? element.control : element

  let files = []

  if (Array.isArray(fileOrFiles)) {
    files = element.accept
      ? fileOrFiles.filter(file => element.accept.includes(file.type))
      : fileOrFiles
  } else {
    files = [fileOrFiles]
  }

  const hasFilesWithInvalidTypes = files.length === 0

  if (hasFilesWithInvalidTypes) return

  files = files.slice(0, input.multiple ? undefined : 1)

  // blur fires when the file selector pops up
  blur(element, init)
  // focus fires when they make their selection
  focus(element, init)

  // the event fired in the browser isn't actually an "input" or "change" event
  // but a new Event with a type set to "input" and "change"
  // Kinda odd...
  const inputFiles = {
    length: files.length,
    item: index => files[index],
    ...files,
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

export {upload}
