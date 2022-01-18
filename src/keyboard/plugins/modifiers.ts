/**
 * This file should contain behavior for modifier keys:
 * https://www.w3.org/TR/uievents-key/#keys-modifier
 */

import {dispatchUIEvent} from '../../document'
import {getKeyEventProps} from '../../utils'
import {behaviorPlugin} from '../types'

const modifierKeys = [
  'Alt',
  'AltGraph',
  'Control',
  'Fn',
  'Meta',
  'Shift',
  'Symbol',
] as const
type ModififierKey = typeof modifierKeys[number]

const modifierLocks = [
  'CapsLock',
  'FnLock',
  'NumLock',
  'ScrollLock',
  'SymbolLock',
] as const
type ModififierLockKey = typeof modifierLocks[number]

// modifierKeys switch on the modifier BEFORE the keydown event
export const preKeydownBehavior: behaviorPlugin[] = [
  {
    matches: keyDef => modifierKeys.includes(keyDef.key as ModififierKey),
    handle: (keyDef, element, {keyboardMap, keyboardState}) => {
      keyboardState.modifiers[keyDef.key as ModififierKey] = true

      // AltGraph produces an extra keydown for Control
      // The modifier does not change
      if (keyDef.key === 'AltGraph') {
        const ctrlKeyDef = keyboardMap.find(
          k => k.key === 'Control',
        ) ?? /* istanbul ignore next */ {key: 'Control', code: 'Control'}
        dispatchUIEvent(
          element,
          'keydown',
          getKeyEventProps(ctrlKeyDef, keyboardState),
        )
      }
    },
  },
  {
    matches: keyDef => modifierLocks.includes(keyDef.key as ModififierLockKey),
    handle: (keyDef, element, {keyboardState}) => {
      const key = keyDef.key as ModififierLockKey
      keyboardState.modifierPhase[key] = keyboardState.modifiers[key]

      if (!keyboardState.modifierPhase[key]) {
        keyboardState.modifiers[key] = true
      }
    },
  },
]

// modifierKeys switch off the modifier BEFORE the keyup event
export const preKeyupBehavior: behaviorPlugin[] = [
  {
    matches: keyDef => modifierKeys.includes(keyDef.key as ModififierKey),
    handle: (keyDef, element, {keyboardState}) => {
      keyboardState.modifiers[keyDef.key as ModififierKey] = false
    },
  },
  {
    matches: keyDef => modifierLocks.includes(keyDef.key as ModififierLockKey),
    handle: (keyDef, element, {keyboardState}) => {
      const key = keyDef.key as ModififierLockKey

      if (keyboardState.modifierPhase[key]) {
        keyboardState.modifiers[key] = false
      }
    },
  },
]

export const postKeyupBehavior: behaviorPlugin[] = [
  // AltGraph produces an extra keyup for Control
  // The modifier does not change
  {
    matches: keyDef => keyDef.key === 'AltGraph',
    handle: (keyDef, element, {keyboardMap, keyboardState}) => {
      const ctrlKeyDef = keyboardMap.find(
        k => k.key === 'Control',
      ) ?? /* istanbul ignore next */ {key: 'Control', code: 'Control'}
      dispatchUIEvent(
        element,
        'keyup',
        getKeyEventProps(ctrlKeyDef, keyboardState),
      )
    },
  },
]
