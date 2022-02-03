import {dispatchUIEvent} from '../event'
import {Config} from '../setup'
import {getActiveElement, getKeyEventProps, wait} from '../utils'
import {behaviorPlugin, keyboardKey} from './types'
import * as plugins from './plugins'

export interface KeyboardAction {
  keyDef: keyboardKey
  releasePrevious: boolean
  releaseSelf: boolean
  repeat: number
}

export async function keyboardAction(
  config: Config,
  actions: KeyboardAction[],
) {
  for (let i = 0; i < actions.length; i++) {
    await keyboardKeyAction(config, actions[i])

    if (typeof config.delay === 'number' && i < actions.length - 1) {
      await wait(config.delay)
    }
  }
}

async function keyboardKeyAction(
  config: Config,
  {keyDef, releasePrevious, releaseSelf, repeat}: KeyboardAction,
) {
  const {document, keyboardState, delay} = config
  const getCurrentElement = () => getActive(document)

  // Release the key automatically if it was pressed before.
  const pressed = keyboardState.pressed.find(p => p.keyDef === keyDef)
  if (pressed) {
    await keyup(keyDef, getCurrentElement, config, pressed.unpreventedDefault)
  }

  if (!releasePrevious) {
    let unpreventedDefault = true
    for (let i = 1; i <= repeat; i++) {
      unpreventedDefault = await keydown(keyDef, getCurrentElement, config)

      if (unpreventedDefault && hasKeyPress(keyDef, config)) {
        await keypress(keyDef, getCurrentElement, config)
      }

      if (typeof delay === 'number' && i < repeat) {
        await wait(delay)
      }
    }

    // Release the key only on the last iteration on `state.repeatKey`.
    if (releaseSelf) {
      await keyup(keyDef, getCurrentElement, config, unpreventedDefault)
    }
  }
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

  const unpreventedDefault = dispatchUIEvent(
    config,
    element,
    'keydown',
    getKeyEventProps(keyDef),
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

  const unpreventedDefault = dispatchUIEvent(config, element, 'keypress', {
    ...getKeyEventProps(keyDef),
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

  const unpreventedDefault = dispatchUIEvent(
    config,
    element,
    'keyup',
    getKeyEventProps(keyDef),
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
    !config.keyboardState.modifiers.Control &&
    !config.keyboardState.modifiers.Alt
  )
}
