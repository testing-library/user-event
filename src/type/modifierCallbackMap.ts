import {fireEvent} from '@testing-library/dom'
import {callback, callbackPayload} from './callbacks'

function createModifierCallbackEntries({
  name,
  key,
  keyCode,
  modifierProperty,
}: {
  name: string
  key: string
  keyCode: number
  modifierProperty: string
}): {[k: string]: callback} {
  const openName = `{${name}}`
  const closeName = `{/${name}}`

  function open({currentElement, eventOverrides}: callbackPayload) {
    const newEventOverrides = {[modifierProperty]: true}

    fireEvent.keyDown(currentElement() as Element, {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
      ...newEventOverrides,
    })

    return {eventOverrides: newEventOverrides}
  }
  open.closeName = closeName
  function close({currentElement, eventOverrides}: callbackPayload) {
    const newEventOverrides = {[modifierProperty]: false}

    fireEvent.keyUp(currentElement() as Element, {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
      ...newEventOverrides,
    })

    return {eventOverrides: newEventOverrides}
  }
  return {
    [openName]: open,
    [closeName]: close,
  }
}

export const modifierCallbackMap: {[k: string]: callback} = {
  ...createModifierCallbackEntries({
    name: 'shift',
    key: 'Shift',
    keyCode: 16,
    modifierProperty: 'shiftKey',
  }),
  ...createModifierCallbackEntries({
    name: 'ctrl',
    key: 'Control',
    keyCode: 17,
    modifierProperty: 'ctrlKey',
  }),
  ...createModifierCallbackEntries({
    name: 'alt',
    key: 'Alt',
    keyCode: 18,
    modifierProperty: 'altKey',
  }),
  ...createModifierCallbackEntries({
    name: 'meta',
    key: 'Meta',
    keyCode: 93,
    modifierProperty: 'metaKey',
  }),
  // capslock is inline because of the need to fire both keydown and keyup on use, while preserving the modifier state.
  '{capslock}': function capslockOn({currentElement, eventOverrides}) {
    const newEventOverrides = {modifierCapsLock: true}

    fireEvent.keyDown(currentElement() as Element, {
      key: 'CapsLock',
      keyCode: 20,
      which: 20,
      ...eventOverrides,
      ...newEventOverrides,
    })
    fireEvent.keyUp(currentElement() as Element, {
      key: 'CapsLock',
      keyCode: 20,
      which: 20,
      ...eventOverrides,
      ...newEventOverrides,
    })

    return {eventOverrides: newEventOverrides}
  },
  '{/capslock}': function capslockOff({currentElement, eventOverrides}) {
    const newEventOverrides = {modifierCapsLock: false}

    fireEvent.keyDown(currentElement() as Element, {
      key: 'CapsLock',
      keyCode: 20,
      which: 20,
      ...eventOverrides,
      ...newEventOverrides,
    })
    fireEvent.keyUp(currentElement() as Element, {
      key: 'CapsLock',
      keyCode: 20,
      which: 20,
      ...eventOverrides,
      ...newEventOverrides,
    })

    return {eventOverrides: newEventOverrides}
  },
}
