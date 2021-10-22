/* eslint-disable complexity */

import {fireEvent} from '@testing-library/dom'
import {
  Coords,
  findClosest,
  firePointerEvent,
  focus,
  isDisabled,
  isElementType,
  isFocusable,
} from '../utils'
import {getUIValue, setUISelection} from '../document'
import type {
  inputDeviceState,
  pointerKey,
  pointerState,
  PointerTarget,
} from './types'

export interface PointerPressAction extends PointerTarget {
  keyDef: pointerKey
  releasePrevious: boolean
  releaseSelf: boolean
}

export async function pointerPress(
  {keyDef, releasePrevious, releaseSelf, target, coords}: PointerPressAction,
  state: inputDeviceState,
): Promise<void> {
  const previous = state.pointerState.pressed.find(p => p.keyDef === keyDef)

  const pointerName =
    keyDef.pointerType === 'touch' ? keyDef.name : keyDef.pointerType

  const targetIsDisabled = isDisabled(target)

  if (previous) {
    up(state, pointerName, keyDef, targetIsDisabled, target, coords, previous)
  }

  if (!releasePrevious) {
    const press = down(
      state,
      pointerName,
      keyDef,
      targetIsDisabled,
      target,
      coords,
    )

    if (releaseSelf) {
      up(state, pointerName, keyDef, targetIsDisabled, target, coords, press)
    }
  }
}

function getNextPointerId(state: pointerState) {
  state.pointerId = state.pointerId + 1
  return state.pointerId
}

function down(
  {pointerState, keyboardState}: inputDeviceState,
  pointerName: string,
  keyDef: pointerKey,
  targetIsDisabled: boolean,
  target: Element,
  coords: Coords,
) {
  const {name, pointerType, button} = keyDef
  const pointerId = pointerType === 'mouse' ? 1 : getNextPointerId(pointerState)

  pointerState.position[pointerName] = {
    pointerId,
    pointerType,
    target,
    coords,
  }

  let isMultiTouch = false
  let isPrimary = true
  if (pointerType !== 'mouse') {
    for (const obj of pointerState.pressed) {
      // TODO: test multi device input across browsers
      // istanbul ignore else
      if (obj.keyDef.pointerType === pointerType) {
        obj.isMultiTouch = true
        isMultiTouch = true
        isPrimary = false
      }
    }
  }

  if (pointerState.activeClickCount?.[0] !== name) {
    delete pointerState.activeClickCount
  }
  const clickCount = Number(pointerState.activeClickCount?.[1] ?? 0) + 1
  pointerState.activeClickCount = [name, clickCount]

  const pressObj = {
    keyDef,
    downTarget: target,
    pointerId,
    unpreventedDefault: true,
    isMultiTouch,
    isPrimary,
    clickCount,
  }
  pointerState.pressed.push(pressObj)

  if (!targetIsDisabled) {
    if (pointerType !== 'mouse') {
      fire('pointerover')
      fire('pointerenter')
    }
    if (
      pointerType !== 'mouse' ||
      !pointerState.pressed.some(
        p => p.keyDef !== keyDef && p.keyDef.pointerType === pointerType,
      )
    ) {
      fire('pointerdown')
    }
    if (pointerType === 'mouse') {
      pressObj.unpreventedDefault = fire('mousedown')
    }

    // TODO: touch...
  }

  if (pointerType === 'mouse' && pressObj.unpreventedDefault) {
    mousedownDefaultBehavior({target, targetIsDisabled, clickCount})
  }

  return pressObj

  function fire(type: string) {
    return firePointerEvent(target, type, {
      pointerState,
      keyboardState,
      button,
      clickCount,
      coords,
      isPrimary,
      pointerId,
      pointerType,
    })
  }
}

function up(
  {pointerState, keyboardState}: inputDeviceState,
  pointerName: string,
  {pointerType, button}: pointerKey,
  targetIsDisabled: boolean,
  target: Element,
  coords: Coords,
  pressed: pointerState['pressed'][number],
) {
  pointerState.pressed = pointerState.pressed.filter(p => p !== pressed)

  const {isMultiTouch, isPrimary, pointerId, clickCount} = pressed
  let {unpreventedDefault} = pressed

  pointerState.position[pointerName] = {
    pointerId,
    pointerType,
    target,
    coords,
  }

  // TODO: pointerleave for touch device

  if (!targetIsDisabled) {
    if (
      pointerType !== 'mouse' ||
      !pointerState.pressed.filter(p => p.keyDef.pointerType === pointerType)
        .length
    ) {
      fire('pointerup')
    }
    if (pointerType !== 'mouse') {
      fire('pointerout')
      fire('pointerleave')
    }
    if (pointerType !== 'mouse' && !isMultiTouch) {
      if (clickCount === 1) {
        fire('mouseover')
        fire('mouseenter')
      }
      fire('mousemove')
      unpreventedDefault = fire('mousedown') && unpreventedDefault
    }
  }

  if (unpreventedDefault && pointerType !== 'mouse' && !isMultiTouch) {
    mousedownDefaultBehavior({target, targetIsDisabled, clickCount})
  }

  if (!targetIsDisabled) {
    if (pointerType === 'mouse' || !isMultiTouch) {
      unpreventedDefault = fire('mouseup') && unpreventedDefault

      const canClick = pointerType !== 'mouse' || button === 'primary'
      if (canClick && target === pressed.downTarget) {
        fire('click')
        if (clickCount === 2) {
          fire('dblclick')
        }

        // If the click happens inside a `label` with a control, the control (or closes focusable) is focused.
        const label = target.closest('label')
        if (label?.control) {
          focus(
            findClosest(label.control, isFocusable) ??
              target.ownerDocument.body,
          )
        }
      }

      if (pointerType === 'mouse' && button === 'secondary') {
        fireEvent.contextMenu(target)
      }
    }
  }

  function fire(type: string) {
    return firePointerEvent(target, type, {
      pointerState,
      keyboardState,
      button,
      clickCount,
      coords,
      isPrimary,
      pointerId,
      pointerType,
    })
  }
}

function mousedownDefaultBehavior({
  target,
  targetIsDisabled,
  clickCount,
}: {
  target: Element
  targetIsDisabled: boolean
  clickCount: number
}) {
  // The closest focusable element is focused when a `mousedown` would have been fired.
  // Even if there was no `mousedown` because the element was disabled.
  // A `mousedown` that preventsDefault cancels this though.
  focus(findClosest(target, isFocusable) ?? target.ownerDocument.body)

  // TODO: What happens if a focus event handler interfers?

  // An unprevented mousedown moves the cursor to the closest character.
  // We try to approximate the behavior for a no-layout environment.
  // TODO: implement for other elements
  if (!targetIsDisabled && isElementType(target, ['input', 'textarea'])) {
    const value = getUIValue(target) as string
    const pos = value.length // might override this per option later

    if (clickCount % 3 === 1 || value.length === 0) {
      setUISelection(target, pos, pos)
    } else if (clickCount % 3 === 2) {
      const isWhitespace = /\s/.test(value.substr(Math.max(0, pos - 1), 1))
      const before = (
        value
          .substr(0, pos)
          .match(isWhitespace ? /\s*$/ : /\S*$/) as RegExpMatchArray
      )[0].length
      const after = (
        value
          .substr(pos)
          .match(isWhitespace ? /^\s*/ : /^\S*/) as RegExpMatchArray
      )[0].length
      setUISelection(target, pos - before, pos + after)
    } else {
      const before = (
        value.substr(0, pos).match(/[^\r\n]*$/) as RegExpMatchArray
      )[0].length
      const after = (value.substr(pos).match(/^[\r\n]*/) as RegExpMatchArray)[0]
        .length
      setUISelection(target, pos - before, pos + after)
    }
  }
}
