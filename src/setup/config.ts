import {keyboardState} from '#src/keyboard/types'
import {pointerState} from '#src/pointer/types'
import {defaultKeyMap as defaultKeyboardMap} from '#src/keyboard/keyMap'
import {defaultKeyMap as defaultPointerMap} from '#src/pointer/keyMap'
import {Options} from '#src/options'

export interface inputDeviceState {
  pointerState: pointerState
  keyboardState: keyboardState
}

export interface Config extends Required<Options>, inputDeviceState {}
export const Config = Symbol('Config')

/**
 * Default options applied when API is called per `userEvent.anyApi()`
 */
export const defaultOptionsDirect: Required<Options> = {
  applyAccept: true,
  autoModify: true,
  delay: 0,
  document: global.document,
  keyboardMap: defaultKeyboardMap,
  pointerMap: defaultPointerMap,
  skipAutoClose: false,
  skipClick: false,
  skipHover: false,
  skipPointerEventsCheck: false,
  writeToClipboard: false,
}

/**
 * Default options applied when API is called per `userEvent().anyApi()`
 */
export const defaultOptionsSetup: Required<Options> = {
  ...defaultOptionsDirect,
  writeToClipboard: true,
}
