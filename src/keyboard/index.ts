import {getConfig as getDOMTestingLibraryConfig} from '@testing-library/dom'
import {prepareDocument} from '../document'
import {keyboardImplementation, releaseAllKeys} from './keyboardImplementation'
import {defaultKeyMap} from './keyMap'
import {keyboardState, keyboardOptions, keyboardKey} from './types'

export {specialCharMap} from './specialCharMap'
export type {keyboardOptions, keyboardKey}

export function keyboard(
  text: string,
  options?: Partial<keyboardOptions & {keyboardState: keyboardState; delay: 0}>,
): keyboardState
export function keyboard(
  text: string,
  options: Partial<
    keyboardOptions & {keyboardState: keyboardState; delay: number}
  >,
): Promise<keyboardState>
export function keyboard(
  text: string,
  options?: Partial<keyboardOptions & {keyboardState: keyboardState}>,
): keyboardState | Promise<keyboardState> {
  const {promise, state} = keyboardImplementationWrapper(text, options)

  if ((options?.delay ?? 0) > 0) {
    return getDOMTestingLibraryConfig().asyncWrapper(() =>
      promise.then(() => state),
    )
  } else {
    // prevent users from dealing with UnhandledPromiseRejectionWarning in sync call
    promise.catch(console.error)

    return state
  }
}

export function keyboardImplementationWrapper(
  text: string,
  config: Partial<keyboardOptions & {keyboardState: keyboardState}> = {},
) {
  const {
    keyboardState: state = createKeyboardState(),
    delay = 0,
    document: doc = document,
    autoModify = false,
    keyboardMap = defaultKeyMap,
  } = config
  const options = {
    delay,
    document: doc,
    autoModify,
    keyboardMap,
  }

  prepareDocument(document)

  return {
    promise: keyboardImplementation(text, options, state),
    state,
    releaseAllKeys: () => releaseAllKeys(options, state),
  }
}

export function createKeyboardState(): keyboardState {
  return {
    activeElement: null,
    pressed: [],
    carryChar: '',
    modifiers: {
      alt: false,
      caps: false,
      ctrl: false,
      meta: false,
      shift: false,
    },
  }
}
