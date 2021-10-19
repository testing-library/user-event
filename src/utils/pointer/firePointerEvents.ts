import {fireEvent} from '@testing-library/dom'
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
    pointerType,
    button,
    buttons,
    coords,
    pointerId,
    isPrimary,
    clickCount,
  }: {
    pointerType?: 'mouse' | 'pen' | 'touch'
    button?: MouseButton
    buttons: MouseButton[]
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
    init.buttons = getMouseButtons(...buttons)
  }
  if (['mousedown', 'mouseup', 'click'].includes(type)) {
    init.detail = clickCount
  }

  return fireEvent(target, new Event(type, init))
}
