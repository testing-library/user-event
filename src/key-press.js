import {fireEvent} from '@testing-library/dom'
import {getActiveElement} from './utils'

function isPrintableCharacter(key) {
  return key.length === 1
}

function keyPress(
  key,
  {alt = false, ctrl = false, meta = false, shift = false} = {},
) {
  const activeElement = getActiveElement(document)

  const event = {
    key,
    altKey: alt,
    ctrlKey: ctrl,
    metaKey: meta,
    shiftKey: shift,
  }

  if (alt) fireEvent.keyDown(activeElement, {key: 'Alt'})
  if (ctrl) fireEvent.keyDown(activeElement, {key: 'Ctrl'})
  if (meta) fireEvent.keyDown(activeElement, {key: 'Meta'})
  if (shift) fireEvent.keyDown(activeElement, {key: 'Shift'})

  fireEvent.keyDown(activeElement, event)
  if (isPrintableCharacter(key)) fireEvent.keyPress(activeElement, event)
  fireEvent.keyUp(activeElement, event)

  if (shift) fireEvent.keyUp(activeElement, {key: 'Shift'})
  if (meta) fireEvent.keyUp(activeElement, {key: 'Meta'})
  if (ctrl) fireEvent.keyUp(activeElement, {key: 'Ctrl'})
  if (alt) fireEvent.keyUp(activeElement, {key: 'Alt'})
}
export {keyPress}
