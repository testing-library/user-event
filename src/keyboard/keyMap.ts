import {DOM_KEY_LOCATION, keyboardKey} from './types'

/**
 * Mapping for a default US-104-QWERTY keyboard
 */
export const defaultKeyMap: keyboardKey[] = [
  // alphanumeric keys
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

  // alphanumeric block - functional
  {code: 'Space', key: ' '},

  {code: 'AltLeft', key: 'Alt', location: DOM_KEY_LOCATION.LEFT},
  {code: 'AltRight', key: 'Alt', location: DOM_KEY_LOCATION.RIGHT},
  {
    code: 'ShiftLeft',
    key: 'Shift',
    location: DOM_KEY_LOCATION.LEFT,
  },
  {
    code: 'ShiftRight',
    key: 'Shift',
    location: DOM_KEY_LOCATION.RIGHT,
  },
  {
    code: 'ControlLeft',
    key: 'Control',
    location: DOM_KEY_LOCATION.LEFT,
  },
  {
    code: 'ControlRight',
    key: 'Control',
    location: DOM_KEY_LOCATION.RIGHT,
  },
  {code: 'MetaLeft', key: 'Meta', location: DOM_KEY_LOCATION.LEFT},
  {
    code: 'MetaRight',
    key: 'Meta',
    location: DOM_KEY_LOCATION.RIGHT,
  },

  {code: 'OSLeft', key: 'OS', location: DOM_KEY_LOCATION.LEFT},
  {code: 'OSRight', key: 'OS', location: DOM_KEY_LOCATION.RIGHT},

  {code: 'Tab', key: 'Tab'},
  {code: 'CapsLock', key: 'CapsLock'},
  {code: 'Backspace', key: 'Backspace'},
  {code: 'Enter', key: 'Enter'},

  // function
  {code: 'Escape', key: 'Escape'},

  // arrows
  {code: 'ArrowUp', key: 'ArrowUp'},
  {code: 'ArrowDown', key: 'ArrowDown'},
  {code: 'ArrowLeft', key: 'ArrowLeft'},
  {code: 'ArrowRight', key: 'ArrowRight'},

  // control pad
  {code: 'Home', key: 'Home'},
  {code: 'End', key: 'End'},
  {code: 'Delete', key: 'Delete'},
  {code: 'PageUp', key: 'PageUp'},
  {code: 'PageDown', key: 'PageDown'},

  // TODO: add mappings
]
