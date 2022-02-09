/**
 * This file should contain behavior for modifier keys:
 * https://www.w3.org/TR/uievents-key/#keys-modifier
 */

import {dispatchUIEvent} from '../event'
import {getKeyEventProps} from '../utils'
import {Config} from '../setup'
import {keyboardKey} from '.'

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

function isModifierKey(key?: string): key is ModififierKey {
  return modifierKeys.includes(key as ModififierKey)
}

const modifierLocks = [
  'CapsLock',
  'FnLock',
  'NumLock',
  'ScrollLock',
  'SymbolLock',
] as const
type ModififierLockKey = typeof modifierLocks[number]

function isModifierLock(key?: string): key is ModififierLockKey {
  return modifierLocks.includes(key as ModififierLockKey)
}

// modifierKeys switch on the modifier BEFORE the keydown event
export function preKeydownBehavior(
  config: Config,
  {key}: keyboardKey,
  element: Element,
) {
  if (isModifierKey(key)) {
    config.keyboardState.modifiers[key] = true

    // AltGraph produces an extra keydown for Control
    // The modifier does not change
    if (key === 'AltGraph') {
      const ctrlKeyDef = config.keyboardMap.find(
        k => k.key === 'Control',
      ) ?? /* istanbul ignore next */ {key: 'Control', code: 'Control'}
      dispatchUIEvent(config, element, 'keydown', getKeyEventProps(ctrlKeyDef))
    }
  } else if (isModifierLock(key)) {
    config.keyboardState.modifierPhase[key] =
      config.keyboardState.modifiers[key]

    if (!config.keyboardState.modifierPhase[key]) {
      config.keyboardState.modifiers[key] = true
    }
  }
}

// modifierKeys switch off the modifier BEFORE the keyup event
export function preKeyupBehavior(config: Config, {key}: keyboardKey) {
  if (isModifierKey(key)) {
    config.keyboardState.modifiers[key] = false
  } else if (isModifierLock(key)) {
    if (config.keyboardState.modifierPhase[key]) {
      config.keyboardState.modifiers[key] = false
    }
  }
}

export function postKeyupBehavior(
  config: Config,
  {key}: keyboardKey,
  element: Element,
) {
  // AltGraph produces an extra keyup for Control
  // The modifier does not change
  if (key === 'AltGraph') {
    const ctrlKeyDef = config.keyboardMap.find(
      k => k.key === 'Control',
    ) ?? /* istanbul ignore next */ {key: 'Control', code: 'Control'}
    dispatchUIEvent(config, element, 'keyup', getKeyEventProps(ctrlKeyDef))
  }
}
