import {fireEvent, createEvent} from '@testing-library/dom'
import {click} from './click'
import {blur} from './blur'
import {focus} from './focus'

function upload(element, fileOrFiles, init, {applyAccept = false} = {}) {
  if (element.disabled) return

  click(element, init)

  const input = element.tagName === 'LABEL' ? element.control : element

  const files = (Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles])
    .filter(file => !applyAccept || isAcceptableFile(file, element.accept))
    .slice(0, input.multiple ? undefined : 1)

  // blur fires when the file selector pops up
  blur(element, init)
  // focus fires when they make their selection
  focus(element, init)

  // treat empty array as if the user just closed the file upload dialog
  if (files.length === 0) {
    return
  }

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

function isAcceptableFile(file, accept) {
  if (!accept) {
    return true
  }

  const wildcards = ['audio/*', 'image/*', 'video/*']

  return accept.split(',').some(acceptToken => {
    if (acceptToken[0] === '.') {
      // tokens starting with a dot represent a file extension
      return file.name.endsWith(acceptToken)
    } else if (wildcards.includes(acceptToken)) {
      return file.type.startsWith(acceptToken.substr(0, acceptToken.length - 1))
    }
    return file.type === acceptToken
  })
}

export {upload}
