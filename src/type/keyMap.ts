import {DOM_KEY_LOCATION, keyboardKey} from './types'

/**
 * Mapping for a default US-104-QWERTY keyboard
 */
export const defaultKeyMap: keyboardKey[] = [
  ...'0123456789'.split('').map(c => ({code: `Digit${c}`, key: c})),
  ...')!@#$%^&*('
    .split('')
    .map((c, i) => ({code: `Digit${i}`, key: c, shiftKey: true})),
  ...'abcdefghijklmnopqrstuvwxyz'
    .split('')
    .map(c => ({code: `Key${c.toUpperCase()}`, key: c})),
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .split('')
    .map(c => ({code: `Key${c}`, key: c, shiftKey: true})),
  {code: 'AltLeft', key: 'Alt', location: DOM_KEY_LOCATION.LEFT},
  {code: 'AltRight', key: 'Alt', location: DOM_KEY_LOCATION.RIGHT},
  {code: 'ShiftLeft', key: 'Shift', location: DOM_KEY_LOCATION.LEFT},
  {code: 'ShiftRight', key: 'Shift', location: DOM_KEY_LOCATION.RIGHT},
  {code: 'ControlLeft', key: 'Control', location: DOM_KEY_LOCATION.LEFT},
  {code: 'ControlRight', key: 'Control', location: DOM_KEY_LOCATION.RIGHT},
  {code: 'MetaLeft', key: 'OS', location: DOM_KEY_LOCATION.LEFT},
  {code: 'MetaRight', key: 'OS', location: DOM_KEY_LOCATION.RIGHT},
  {code: 'CapsLock', key: 'CapsLock'},
  {code: 'Backspace', key: 'Backspace', keyCode: 8},
  {code: 'Enter', key: 'Enter', keyCode: 13},
  {code: 'ArrowUp', key: 'ArrowUp', keyCode: 38},
  {code: 'ArrowDown', key: 'ArrowDown', keyCode: 40},
  {code: 'ArrowLeft', key: 'ArrowLeft', keyCode: 37},
  {code: 'ArrowRight', key: 'ArrowRight', keyCode: 39},
  {code: 'Home', key: 'Home', keyCode: 36},
  {code: 'End', key: 'End', keyCode: 35},

  // TODO: add mappings
]
