/* eslint-disable complexity */

import {
  ApiLevel,
  assertPointerEvents,
  focus,
  isDisabled,
  isElementType,
  setLevelRef,
} from '../utils'
import {getUIValue, setUISelection} from '../document'
import {EventType} from '../event'
import {Config} from '../setup'
import type {
  pointerKey,
  pointerState,
  PointerTarget,
  SelectionTarget,
} from './types'
import {resolveSelectionTarget} from './resolveSelectionTarget'
import {firePointerEvent} from './firePointerEvents'

export interface PointerPressAction extends PointerTarget, SelectionTarget {
  keyDef: pointerKey
  releasePrevious: boolean
  releaseSelf: boolean
}

export async function pointerPress(
  config: Config,
  action: PointerPressAction,
): Promise<void> {
  const {keyDef, target, releasePrevious, releaseSelf} = action
  const previous = config.pointerState.pressed.find(p => p.keyDef === keyDef)

  const pointerName =
    keyDef.pointerType === 'touch' ? keyDef.name : keyDef.pointerType

  const targetIsDisabled = isDisabled(target)

  if (previous) {
    up(config, pointerName, action, previous, targetIsDisabled)
  }

  if (!releasePrevious) {
    const press = down(config, pointerName, action, targetIsDisabled)

    if (releaseSelf) {
      up(config, pointerName, action, press, targetIsDisabled)
    }
  }
}

function getNextPointerId(state: pointerState) {
  state.pointerId = state.pointerId + 1
  return state.pointerId
}

function down(
  config: Config,
  pointerName: string,
  {keyDef, node, offset, target, coords}: PointerPressAction,
  targetIsDisabled: boolean,
) {
  setLevelRef(config, ApiLevel.Trigger)
  assertPointerEvents(config, target)

  const {pointerState} = config
  const {name, pointerType, button} = keyDef
  const pointerId = pointerType === 'mouse' ? 1 : getNextPointerId(pointerState)

  pointerState.position[pointerName] = {
    ...pointerState.position[pointerName],
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

  // TODO: touch...

  if (pointerType === 'mouse') {
    if (!targetIsDisabled) {
      pressObj.unpreventedDefault = fire('mousedown')
    }

    if (pressObj.unpreventedDefault) {
      mousedownDefaultBehavior({
        target,
        targetIsDisabled,
        clickCount,
        position: pointerState.position[pointerName],
        node,
        offset,
      })
    }

    if (button === 'secondary') {
      fire('contextmenu')
    }
  }

  return pressObj

  function fire(type: EventType) {
    return firePointerEvent(config, target, type, {
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
  config: Config,
  pointerName: string,
  {
    keyDef: {pointerType, button},
    target,
    coords,
    node,
    offset,
  }: PointerPressAction,
  pressed: pointerState['pressed'][number],
  targetIsDisabled: boolean,
) {
  setLevelRef(config, ApiLevel.Trigger)
  assertPointerEvents(config, target)

  const {pointerState} = config
  pointerState.pressed = pointerState.pressed.filter(p => p !== pressed)

  const {isMultiTouch, isPrimary, pointerId, clickCount} = pressed
  let {unpreventedDefault} = pressed

  pointerState.position[pointerName] = {
    ...pointerState.position[pointerName],
    target,
    coords,
  }

  // TODO: pointerleave for touch device

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
    if (!targetIsDisabled) {
      if (clickCount === 1) {
        fire('mouseover')
        fire('mouseenter')
      }
      fire('mousemove')
      unpreventedDefault = fire('mousedown') && unpreventedDefault
    }

    if (unpreventedDefault) {
      mousedownDefaultBehavior({
        target,
        targetIsDisabled,
        clickCount,
        position: pointerState.position[pointerName],
        node,
        offset,
      })
    }
  }

  delete pointerState.position[pointerName].selectionRange

  if (!targetIsDisabled) {
    if (pointerType === 'mouse' || !isMultiTouch) {
      unpreventedDefault = fire('mouseup') && unpreventedDefault

      const canClick = pointerType !== 'mouse' || button === 'primary'
      if (canClick && target === pressed.downTarget) {
        fire('click')

        if (clickCount === 2) {
          fire('dblclick')
        }
      }
    }
  }

  function fire(type: EventType) {
    return firePointerEvent(config, target, type, {
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
  position,
  target,
  targetIsDisabled,
  clickCount,
  node,
  offset,
}: {
  position: NonNullable<pointerState['position']['string']>
  target: Element
  targetIsDisabled: boolean
  clickCount: number
  node?: Node
  offset?: number
}) {
  // An unprevented mousedown moves the cursor to the closest character.
  // We try to approximate the behavior for a no-layout environment.
  if (!targetIsDisabled) {
    const hasValue = isElementType(target, ['input', 'textarea'])

    // On non-input elements the text selection per multiple click
    // can extend beyond the target boundaries.
    // The exact mechanism what is considered in the same line is unclear.
    // Looks it might be every inline element.
    // TODO: Check what might be considered part of the same line of text.
    const text = String(hasValue ? getUIValue(target) : target.textContent)

    const [start, end] = node
      ? // As offset is describing a DOMOffset it is non-trivial to determine
        // which elements might be considered in the same line of text.
        // TODO: support expanding initial range on multiple clicks if node is given
        [offset, offset]
      : getTextRange(text, offset, clickCount)

    // TODO: implement modifying selection per shift/ctrl+mouse
    if (hasValue) {
      setUISelection(target, {
        anchorOffset: start ?? text.length,
        focusOffset: end ?? text.length,
      })
      position.selectionRange = {
        node: target,
        start: start ?? 0,
        end: end ?? text.length,
      }
    } else {
      const {node: startNode, offset: startOffset} = resolveSelectionTarget({
        target,
        node,
        offset: start,
      })
      const {node: endNode, offset: endOffset} = resolveSelectionTarget({
        target,
        node,
        offset: end,
      })

      const range = target.ownerDocument.createRange()
      range.setStart(startNode, startOffset)
      range.setEnd(endNode, endOffset)

      position.selectionRange = range

      const selection = target.ownerDocument.getSelection() as Selection
      selection.removeAllRanges()
      selection.addRange(range.cloneRange())
    }
  }

  // The closest focusable element is focused when a `mousedown` would have been fired.
  // Even if there was no `mousedown` because the element was disabled.
  // A `mousedown` that preventsDefault cancels this though.
  focus(target)
}

function getTextRange(
  text: string,
  pos: number | undefined,
  clickCount: number,
) {
  if (clickCount % 3 === 1 || text.length === 0) {
    return [pos, pos]
  }

  const textPos = pos ?? text.length
  if (clickCount % 3 === 2) {
    return [
      textPos -
        (text.substr(0, pos).match(/(\w+|\s+|\W)?$/) as RegExpMatchArray)[0]
          .length,
      pos === undefined
        ? pos
        : pos +
          (text.substr(pos).match(/^(\w+|\s+|\W)?/) as RegExpMatchArray)[0]
            .length,
    ]
  }

  // triple click
  return [
    textPos -
      (text.substr(0, pos).match(/[^\r\n]*$/) as RegExpMatchArray)[0].length,
    pos === undefined
      ? pos
      : pos +
        (text.substr(pos).match(/^[^\r\n]*/) as RegExpMatchArray)[0].length,
  ]
}
