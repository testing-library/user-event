import {fireEvent} from '@testing-library/dom'
import type {pointerState} from 'pointer/types'
import type {keyboardState} from 'keyboard/types'
import {FakeEventInit, FakeMouseEvent, FakePointerEvent} from './fakeEvent'
import {getMouseButton, getMouseButtons, MouseButton} from './mouseButtons'

export interface Coords {
  x: number
  y: number
  clientX: number
  clientY: number
  offsetX: number
  offsetY: number
  pageX: number
  pageY: number
}

export function firePointerEvent(
  target: Element,
  type: string,
  {
    pointerState,
    keyboardState,
    pointerType,
    button,
    coords,
    pointerId,
    isPrimary,
    clickCount,
  }: {
    pointerState: pointerState
    keyboardState: keyboardState
    pointerType?: 'mouse' | 'pen' | 'touch'
    button?: MouseButton
    coords: Coords
    pointerId?: number
    isPrimary?: boolean
    clickCount?: number
  },
) {
  const Event =
    type === 'click' || type.startsWith('mouse')
      ? FakeMouseEvent
      : FakePointerEvent

  let init: FakeEventInit = {
    ...coords,
    altKey: keyboardState.modifiers.alt,
    ctrlKey: keyboardState.modifiers.ctrl,
    metaKey: keyboardState.modifiers.meta,
    shiftKey: keyboardState.modifiers.shift,
  }
  if (Event === FakePointerEvent) {
    init = {...init, pointerId, pointerType}
  }
  if (['pointerdown', 'pointerup'].includes(type)) {
    init.isPrimary = isPrimary
  }
  if (
    ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'click'].includes(type)
  ) {
    init.button = getMouseButton(button ?? 0)
    init.buttons = getMouseButtons(
      ...pointerState.pressed
        .filter(p => p.keyDef.pointerType === pointerType)
        .map(p => p.keyDef.button ?? 0),
    )
  }
  if (['mousedown', 'mouseup', 'click'].includes(type)) {
    init.detail = clickCount
  }

  return fireEvent(target, new Event(type, init))
}
