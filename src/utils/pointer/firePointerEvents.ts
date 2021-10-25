import {fireEvent} from '@testing-library/dom'
import type {pointerState} from '../../pointer/types'
import type {keyboardState} from '../../keyboard/types'
import {
  FakeMouseEvent,
  FakePointerEvent,
  FakePointerEventInit,
  PointerCoords,
} from './fakeEvent'
import {getMouseButton, getMouseButtons, MouseButton} from './mouseButtons'

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
    coords?: PointerCoords
    pointerId?: number
    isPrimary?: boolean
    clickCount?: number
  },
) {
  const Event =
    type === 'click' || type.startsWith('mouse')
      ? FakeMouseEvent
      : FakePointerEvent

  const init: FakePointerEventInit = {
    ...coords,
    altKey: keyboardState.modifiers.alt,
    ctrlKey: keyboardState.modifiers.ctrl,
    metaKey: keyboardState.modifiers.meta,
    shiftKey: keyboardState.modifiers.shift,
  }
  if (Event === FakePointerEvent || type === 'click') {
    init.pointerId = pointerId
    init.pointerType = pointerType
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
