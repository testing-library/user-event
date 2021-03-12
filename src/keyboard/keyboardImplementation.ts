import {getActiveElement, wait} from '../utils'
import {getNextKeyDef} from './getNextKeyDef'
import {
  behaviorPlugin,
  keyboardKey,
  keyboardState,
  modernTypeOptions,
} from './types'
import * as plugins from './plugins'
import {fireEvent} from '@testing-library/dom'
import {getKeyEventProps} from './getEventProps'

export async function keyboardImplementation(
  document: Document,
  text: string,
  options: modernTypeOptions,
  state: keyboardState,
): Promise<void> {
  const getCurrentElement = () =>
    getActiveElement(document) ?? /* istanbul ignore next */ document.body
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

      if (
        unpreventedDefault &&
        (keyDef.key?.length === 1 || keyDef.key === 'Enter')
      ) {
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
    await keyboardImplementation(
      document,
      text.slice(consumedLength),
      options,
      state,
    )
  } else if (!options.skipAutoClose) {
    for (const k of state.pressed) {
      keyup(k.keyDef, getCurrentElement, options, state, k.unpreventedDefault)
    }
  }
}

function keydown(
  keyDef: keyboardKey,
  getCurrentElement: () => Element,
  options: modernTypeOptions,
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
  options: modernTypeOptions,
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
  options: modernTypeOptions,
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
  options: modernTypeOptions,
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
