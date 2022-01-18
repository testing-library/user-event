import {fireEvent} from '@testing-library/dom'
import {getUIEventModifiers} from '../utils/keyboard/getUIEventModifiers'
import type {keyboardState} from '../keyboard/types'
import {
  createEvent,
  getMouseButton,
  getMouseButtons,
  MouseButton,
  PointerCoords,
} from '../utils'
import type {pointerState} from './types'

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
  const init: MouseEventInit & PointerEventInit = {
    ...coords,
    ...getUIEventModifiers(keyboardState),
  }
  if (type === 'click' || type.startsWith('pointer')) {
    init.pointerId = pointerId
    init.pointerType = pointerType
  }
  if (['pointerdown', 'pointerup'].includes(type)) {
    init.isPrimary = isPrimary
  }
  init.button = getMouseButton(button ?? 0)
  init.buttons = getMouseButtons(
    ...pointerState.pressed
      .filter(p => p.keyDef.pointerType === pointerType)
      .map(p => p.keyDef.button ?? 0),
  )
  if (
    ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu'].includes(type)
  ) {
    init.detail = clickCount
  }

  return fireEvent(target, createEvent(type, target, init))
}
