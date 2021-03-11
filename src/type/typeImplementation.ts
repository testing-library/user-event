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
import { getKeyEventProps } from './getKeyEventProps'
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
  const currentElement = () => getActiveElement(document) ?? document.body
  const {keyDef, consumedLength, releasePrevious, releaseSelf} = getNextKeyDef(text, options)

  if (releasePrevious || state.pressed.includes(keyDef)) {
    // this should probably throw an error when trying to release a key that is not pressed
    keyup(keyDef, currentElement(), options, state)
  }

  if (!releasePrevious) {
    keydown(keyDef, currentElement(), options, state)

    if (releaseSelf) {
      keyup(keyDef, currentElement(), options, state)
    }
  }

  if (text.length > consumedLength) {
    if (options.delay > 0) {
      await wait(options.delay)
    }
    await modernTypeImplementation(document, text.slice(consumedLength), options, state)
  }
}

function keydown(
  keyDef: keyboardKey,
  element: Element,
  options: modernTypeOptions,
  state: keyboardState
) {
  // clear carried characters when focus is moved
  if (element !== state.activeElement) {
    state.carryChar = ''
  }
  state.activeElement = element

  const replace = applyPlugins(plugins.replaceKeydownBehavior, keyDef, element, options, state)
  if (replace) {
    return
  }

  applyPlugins(plugins.preKeydownBehavior, keyDef, element, options, state)

  const unpreventedDefault = fireEvent.keyDown(element, getKeyEventProps(keyDef, state))

  state.pressed.push(keyDef)

  if (unpreventedDefault) {
    applyPlugins(plugins.keydownBehavior, keyDef, element, options, state)
  }
}

function keyup(
  keyDef: keyboardKey,
  element: Element,
  options: modernTypeOptions,
  state: keyboardState
) {
  fireEvent.keyUp(element, getKeyEventProps(keyDef, state))

  state.pressed = state.pressed.filter(k => k === keyDef)

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
