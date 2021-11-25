import {fireEvent} from '@testing-library/dom'
import {Config} from '../setup'
import {getActiveElement, wait} from '../utils'
import {getNextKeyDef} from './getNextKeyDef'
import {behaviorPlugin, keyboardKey} from './types'
import * as plugins from './plugins'
import {getKeyEventProps} from './getEventProps'

export async function keyboardImplementation(
  config: Config,
  text: string,
): Promise<void> {
  const {document, keyboardState, keyboardMap, delay} = config
  const getCurrentElement = () => getActive(document)

  const {keyDef, consumedLength, releasePrevious, releaseSelf, repeat} =
    keyboardState.repeatKey ?? getNextKeyDef(keyboardMap, text)

  const pressed = keyboardState.pressed.find(p => p.keyDef === keyDef)

  // Release the key automatically if it was pressed before.
  // Do not release the key on iterations on `state.repeatKey`.
  if (pressed && !keyboardState.repeatKey) {
    await keyup(keyDef, getCurrentElement, config, pressed.unpreventedDefault)
  }

  if (!releasePrevious) {
    const unpreventedDefault = await keydown(keyDef, getCurrentElement, config)

    if (unpreventedDefault && hasKeyPress(keyDef, config)) {
      await keypress(keyDef, getCurrentElement, config)
    }

    // Release the key only on the last iteration on `state.repeatKey`.
    if (releaseSelf && repeat <= 1) {
      await keyup(keyDef, getCurrentElement, config, unpreventedDefault)
    }
  }

  if (repeat > 1) {
    keyboardState.repeatKey = {
      // don't consume again on the next iteration
      consumedLength: 0,
      keyDef,
      releasePrevious,
      releaseSelf,
      repeat: repeat - 1,
    }
  } else {
    delete keyboardState.repeatKey
  }

  if (text.length > consumedLength || repeat > 1) {
    if (typeof delay === 'number') {
      await wait(delay)
    }

    return keyboardImplementation(config, text.slice(consumedLength))
  }
  return void undefined
}

function getActive(document: Document): Element {
  return getActiveElement(document) ?? /* istanbul ignore next */ document.body
}

export async function releaseAllKeys(config: Config) {
  const getCurrentElement = () => getActive(config.document)
  for (const k of config.keyboardState.pressed) {
    await keyup(k.keyDef, getCurrentElement, config, k.unpreventedDefault)
  }
}

async function keydown(
  keyDef: keyboardKey,
  getCurrentElement: () => Element,
  config: Config,
) {
  const element = getCurrentElement()

  // clear carried characters when focus is moved
  if (element !== config.keyboardState.activeElement) {
    config.keyboardState.carryValue = undefined
    config.keyboardState.carryChar = ''
  }
  config.keyboardState.activeElement = element

  applyPlugins(plugins.preKeydownBehavior, keyDef, element, config)

  const unpreventedDefault = fireEvent.keyDown(
    element,
    getKeyEventProps(keyDef, config.keyboardState),
  )

  config.keyboardState.pressed.push({keyDef, unpreventedDefault})

  if (unpreventedDefault) {
    // all default behavior like keypress/submit etc is applied to the currentElement
    applyPlugins(plugins.keydownBehavior, keyDef, getCurrentElement(), config)
  }

  return unpreventedDefault
}

async function keypress(
  keyDef: keyboardKey,
  getCurrentElement: () => Element,
  config: Config,
) {
  const element = getCurrentElement()

  const unpreventedDefault = fireEvent.keyPress(element, {
    ...getKeyEventProps(keyDef, config.keyboardState),
    charCode: keyDef.key === 'Enter' ? 13 : String(keyDef.key).charCodeAt(0),
  })

  if (unpreventedDefault) {
    applyPlugins(plugins.keypressBehavior, keyDef, getCurrentElement(), config)
  }
}

async function keyup(
  keyDef: keyboardKey,
  getCurrentElement: () => Element,
  config: Config,
  unprevented: boolean,
) {
  const element = getCurrentElement()

  applyPlugins(plugins.preKeyupBehavior, keyDef, element, config)

  const unpreventedDefault = fireEvent.keyUp(
    element,
    getKeyEventProps(keyDef, config.keyboardState),
  )

  if (unprevented && unpreventedDefault) {
    applyPlugins(plugins.keyupBehavior, keyDef, getCurrentElement(), config)
  }

  config.keyboardState.pressed = config.keyboardState.pressed.filter(
    k => k.keyDef !== keyDef,
  )

  applyPlugins(plugins.postKeyupBehavior, keyDef, element, config)
}

function applyPlugins(
  pluginCollection: behaviorPlugin[],
  keyDef: keyboardKey,
  element: Element,
  config: Config,
): boolean {
  const plugin = pluginCollection.find(p => p.matches(keyDef, element, config))

  if (plugin) {
    plugin.handle(keyDef, element, config)
  }

  return !!plugin
}

function hasKeyPress(keyDef: keyboardKey, config: Config) {
  return (
    (keyDef.key?.length === 1 || keyDef.key === 'Enter') &&
    !config.keyboardState.modifiers.ctrl &&
    !config.keyboardState.modifiers.alt
  )
}
