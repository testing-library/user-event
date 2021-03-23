import {fireEvent} from '@testing-library/dom'
import {getActiveElement, wait} from '../utils'
import {getNextKeyDef} from './getNextKeyDef'
import {
  behaviorPlugin,
  keyboardKey,
  keyboardState,
  keyboardOptions,
} from './types'
import * as plugins from './plugins'
import {getKeyEventProps} from './getEventProps'

export async function keyboardImplementation(
  text: string,
  options: keyboardOptions,
  state: keyboardState,
): Promise<void> {
  const {document} = options
  const getCurrentElement = () => getActive(document)

  const {keyDef, consumedLength, releasePrevious, releaseSelf} = getNextKeyDef(
    text,
    options,
  )

  const replace = applyPlugins(
    plugins.replaceBehavior,
    keyDef,
    getCurrentElement(),
    options,
    state,
  )
  if (!replace) {
    const pressed = state.pressed.find(p => p.keyDef === keyDef)

    if (pressed) {
      keyup(
        keyDef,
        getCurrentElement,
        options,
        state,
        pressed.unpreventedDefault,
      )
    }

    if (!releasePrevious) {
      const unpreventedDefault = keydown(
        keyDef,
        getCurrentElement,
        options,
        state,
      )

      if (unpreventedDefault && hasKeyPress(keyDef, state)) {
        keypress(keyDef, getCurrentElement, options, state)
      }

      if (releaseSelf) {
        keyup(keyDef, getCurrentElement, options, state, unpreventedDefault)
      }
    }
  }

  if (text.length > consumedLength) {
    if (options.delay > 0) {
      await wait(options.delay)
    }
    return keyboardImplementation(text.slice(consumedLength), options, state)
  }
  return void undefined
}

function getActive(document: Document): Element {
  return getActiveElement(document) ?? /* istanbul ignore next */ document.body
}

export function releaseAllKeys(options: keyboardOptions, state: keyboardState) {
  const getCurrentElement = () => getActive(options.document)
  for (const k of state.pressed) {
    keyup(k.keyDef, getCurrentElement, options, state, k.unpreventedDefault)
  }
}

function keydown(
  keyDef: keyboardKey,
  getCurrentElement: () => Element,
  options: keyboardOptions,
  state: keyboardState,
) {
  const element = getCurrentElement()

  // clear carried characters when focus is moved
  if (element !== state.activeElement) {
    state.carryValue = undefined
    state.carryChar = ''
  }
  state.activeElement = element

  applyPlugins(plugins.preKeydownBehavior, keyDef, element, options, state)

  const unpreventedDefault = fireEvent.keyDown(
    element,
    getKeyEventProps(keyDef, state),
  )

  state.pressed.push({keyDef, unpreventedDefault})

  if (unpreventedDefault) {
    // all default behavior like keypress/submit etc is applied to the currentElement
    applyPlugins(
      plugins.keydownBehavior,
      keyDef,
      getCurrentElement(),
      options,
      state,
    )
  }

  return unpreventedDefault
}

function keypress(
  keyDef: keyboardKey,
  getCurrentElement: () => Element,
  options: keyboardOptions,
  state: keyboardState,
) {
  const element = getCurrentElement()

  const unpreventedDefault = fireEvent.keyPress(
    element,
    getKeyEventProps(keyDef, state),
  )

  if (unpreventedDefault) {
    applyPlugins(
      plugins.keypressBehavior,
      keyDef,
      getCurrentElement(),
      options,
      state,
    )
  }
}

function keyup(
  keyDef: keyboardKey,
  getCurrentElement: () => Element,
  options: keyboardOptions,
  state: keyboardState,
  unprevented: boolean,
) {
  const element = getCurrentElement()

  applyPlugins(plugins.preKeyupBehavior, keyDef, element, options, state)

  const unpreventedDefault = fireEvent.keyUp(
    element,
    getKeyEventProps(keyDef, state),
  )

  if (unprevented && unpreventedDefault) {
    applyPlugins(
      plugins.keyupBehavior,
      keyDef,
      getCurrentElement(),
      options,
      state,
    )
  }

  state.pressed = state.pressed.filter(k => k.keyDef !== keyDef)

  applyPlugins(plugins.postKeyupBehavior, keyDef, element, options, state)
}

function applyPlugins(
  pluginCollection: behaviorPlugin[],
  keyDef: keyboardKey,
  element: Element,
  options: keyboardOptions,
  state: keyboardState,
): boolean {
  const plugin = pluginCollection.find(p =>
    p.matches(keyDef, element, options, state),
  )

  if (plugin) {
    plugin.handle(keyDef, element, options, state)
  }

  return !!plugin
}

function hasKeyPress(keyDef: keyboardKey, state: keyboardState) {
  return (
    (keyDef.key?.length === 1 || keyDef.key === 'Enter') &&
    !state.modifiers.ctrl &&
    !state.modifiers.alt
  )
}
