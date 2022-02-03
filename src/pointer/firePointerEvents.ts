import {dispatchUIEvent, EventType, PointerCoords} from '../event'
import {Config} from '../setup'
import {getMouseButton, getMouseButtons, MouseButton} from '../utils'

export function firePointerEvent(
  config: Config,
  target: Element,
  type: EventType,
  {
    pointerType,
    button,
    coords,
    pointerId,
    isPrimary,
    clickCount,
  }: {
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
    ...config.pointerState.pressed
      .filter(p => p.keyDef.pointerType === pointerType)
      .map(p => p.keyDef.button ?? 0),
  )
  if (
    ['mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu'].includes(type)
  ) {
    init.detail = clickCount
  }

  return dispatchUIEvent(config, target, type, init)
}
