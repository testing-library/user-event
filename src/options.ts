import type {keyboardKey} from './keyboard/types'
import type {pointerKey} from './pointer/types'
import {defaultKeyMap as defaultKeyboardMap} from './keyboard/keyMap'
import {defaultKeyMap as defaultPointerMap} from './pointer/keyMap'

export interface Options {
  /**
   * When using `userEvent.upload`, automatically discard files
   * that don't match an `accept` property if it exists.
   *
   * @default true
   */
  applyAccept?: boolean

  /**
   * We intend to automatically apply modifier keys for printable characters in the future.
   * I.e. `A` implying `{Shift>}a{/Shift}` if caps lock is not active.
   *
   * This options allows you to opt out of this change in foresight.
   * The feature therefore will not constitute a breaking change.
   *
   * @default true
   */
  autoModify?: boolean

  /**
   * Between some subsequent inputs like typing a series of characters
   * the code execution is delayed per `setTimeout` for (at least) `delay` seconds.
   * This moves the next changes at least to next macro task
   * and allows other (asynchronous) code to run between events.
   *
   * `null` prevents `setTimeout` from being called.
   *
   * @default 0
   */
  delay?: number | null

  /**
   * The document.
   *
   * This defaults to the owner document of an element if an API is called directly with an element and without setup.
   * Otherwise it falls back to the global document.
   *
   * @default element.ownerDocument??global.document
   */
  document?: Document

  /**
   * An array of keyboard keys the keyboard device consists of.
   *
   * This allows to plug in different layouts / localizations.
   *
   * Defaults to a "standard" US-104-QWERTY keyboard.
   */
  keyboardMap?: keyboardKey[]

  /**
   * An array of available pointer keys.
   *
   * This allows to plug in different pointer devices.
   */
  pointerMap?: pointerKey[]

  /**
   * `userEvent.type` automatically releases any keys still pressed at the end of the call.
   * This option allows to opt out of this feature.
   *
   * @default false
   */
  skipAutoClose?: boolean

  /**
   * `userEvent.type` implys a click at the end of the element content/value.
   * This option allows to opt out of this feature.
   *
   * @default false
   */
  skipClick?: boolean

  /**
   * `userEvent.click` implys moving the cursor to the target element first.
   * This options allows to opt out of this feature.
   *
   * @default false
   */
  skipHover?: boolean

  /**
   * Calling pointer related APIs on an element triggers a check if that element can receive pointer events.
   * This check is known to be expensive.
   * This option allows to skip the check.
   *
   * @default false
   */
  skipPointerEventsCheck?: boolean

  /**
   * Write selected data to Clipboard API when a `cut` or `copy` is triggered.
   *
   * The Clipboard API is usually not available to test code.
   * Our `setup` replaces the `navigator.clipboard` property with a stub.
   *
   * Defaults to `false` when calling the APIs directly.
   * Defaults to `true` when calling the APIs per `setup`.
   */
  writeToClipboard?: boolean
}

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
