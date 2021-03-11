import { fireEvent } from '@testing-library/dom'
// TODO: wrap in asyncWrapper
import {
  setSelectionRangeIfNecessary,
  getSelectionRange,
  getValue,
  isContentEditable,
  getActiveElement,
} from '../utils'
import {click} from '../click'
import { getNextKeyDef } from './getNextKeyDef'
import type { modernTypeOptions, keyboardState, behaviorPlugin, keyboardKey } from './types'
import * as plugins from './plugins'
import { getKeyEventProps } from './getEventProps'
import { defaultKeyMap } from './keyMap'

export interface typeOptions {
  delay?: number
  skipClick?: boolean
  skipAutoClose?: boolean
  initialSelectionStart?: number
  initialSelectionEnd?: number
}

export async function typeImplementation(
  element: Element,
  text: string,
  {
    delay,
    skipClick = false,
    skipAutoClose = false,
    initialSelectionStart = undefined,
    initialSelectionEnd = undefined,
  }: typeOptions & {delay: number},
) {
  // TODO: properly type guard
  // we use this workaround for now to prevent changing behavior
  if ((element as {disabled?: boolean}).disabled) return

  if (!skipClick) click(element)

  if (isContentEditable(element)) {
    const selection = document.getSelection()
    // istanbul ignore else
    if (selection && selection.rangeCount === 0) {
      const range = document.createRange()
      range.setStart(element, 0)
      range.setEnd(element, 0)
      selection.addRange(range)
    }
  }
  // The focused element could change between each event, so get the currently active element each time
  const currentElement = () => getActiveElement(element.ownerDocument)

  // by default, a new element has it's selection start and end at 0
  // but most of the time when people call "type", they expect it to type
  // at the end of the current input value. So, if the selection start
  // and end are both the default of 0, then we'll go ahead and change
  // them to the length of the current value.
  // the only time it would make sense to pass the initialSelectionStart or
  // initialSelectionEnd is if you have an input with a value and want to
  // explicitely start typing with the cursor at 0. Not super common.
  const value = getValue(currentElement())

  const {selectionStart, selectionEnd} = getSelectionRange(element)

  if (value != null && selectionStart === 0 && selectionEnd === 0) {
    setSelectionRangeIfNecessary(
      currentElement() as Element,
      initialSelectionStart ?? value.length,
      initialSelectionEnd ?? value.length,
    )
  }

  // previous implementation did wait before the first character
  // this probably can be removed
  if (delay > 0) {
    await wait(delay)
  }

  await modernTypeImplementation(
    element.ownerDocument,
    text,
    {
      delay,
      autoModify: false,
      keyboardMap: defaultKeyMap,
      skipAutoClose
    },
    createKeyboardState(),
  ).catch(e => console.error(e))
}

function wait(time?: number) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), time))
}

function createKeyboardState(): keyboardState {
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

async function modernTypeImplementation(
  document: Document,
  text: string,
  options: modernTypeOptions,
  state: keyboardState,
): Promise<void> {
  const getCurrentElement = () => getActiveElement(document) ?? document.body
  const {keyDef, consumedLength, releasePrevious, releaseSelf} = getNextKeyDef(text, options)

  const replace = applyPlugins(plugins.replaceBehavior, keyDef, getCurrentElement(), options, state)
  if (!replace) {

    const pressed = state.pressed.find(p => p.keyDef === keyDef)

    if (pressed) {
      keyup(keyDef, getCurrentElement, options, state, pressed.unpreventedDefault)
    }

    if (!releasePrevious) {
      const unpreventedDefault = keydown(keyDef, getCurrentElement, options, state)

      if (unpreventedDefault && (keyDef.key?.length === 1 || keyDef.key === 'Enter')) {
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
    await modernTypeImplementation(document, text.slice(consumedLength), options, state)
  } else if(!options.skipAutoClose) {
    for (const k of state.pressed) {
      keyup(k.keyDef, getCurrentElement, options, state, k.unpreventedDefault)
    }
  }
}

function keydown(
  keyDef: keyboardKey,
  getCurrentElement: () => Element,
  options: modernTypeOptions,
  state: keyboardState
) {
  const element = getCurrentElement()

  // clear carried characters when focus is moved
  if (element !== state.activeElement) {
    state.carryValue = undefined
    state.carryChar = ''
  }
  state.activeElement = element

  applyPlugins(plugins.preKeydownBehavior, keyDef, element, options, state)

  const unpreventedDefault = fireEvent.keyDown(element, getKeyEventProps(keyDef, state))

  state.pressed.push({keyDef, unpreventedDefault})

  if (unpreventedDefault) {
    // all default behavior like keypress/submit etc is applied to the currentElement
    applyPlugins(plugins.keydownBehavior, keyDef, getCurrentElement(), options, state)
  }

  return unpreventedDefault
}

function keypress(
  keyDef: keyboardKey,
  getCurrentElement: () => Element,
  options: modernTypeOptions,
  state: keyboardState
) {
  const element = getCurrentElement()

  const unpreventedDefault = fireEvent.keyPress(element, getKeyEventProps(keyDef, state))

  if (unpreventedDefault) {
    applyPlugins(plugins.keypressBehavior, keyDef, getCurrentElement(), options, state)
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

  const unpreventedDefault = fireEvent.keyUp(element, getKeyEventProps(keyDef, state))

  if (unprevented && unpreventedDefault) {
    applyPlugins(plugins.keyupBehavior, keyDef, getCurrentElement(), options, state)
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
  const plugin = pluginCollection.find(p => p.matches(keyDef, element, options, state))

  if (plugin) {
    plugin.handle(keyDef, element, options, state)
  }

  return !!plugin
}
