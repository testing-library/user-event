import {fireEvent, createEvent} from '@testing-library/dom'
import {wrapInEventWrapper} from './utils'
import {click} from './click'
import {blur} from './blur'
import {focus} from './focus'

function upload(element, fileOrFiles, init) {
  if (element.disabled) return

  let files
  let input = element

  click(element, init)
  if (element.tagName === 'LABEL') {
    files = element.control.multiple ? fileOrFiles : [fileOrFiles]
    input = element.control
  } else {
    files = element.multiple ? fileOrFiles : [fileOrFiles]
  }

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
upload = wrapInEventWrapper(upload)

export {upload}
