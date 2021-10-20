import {Coords, firePointerEvent, isDescendantOrSelf} from '../utils'
import {inputDeviceState, PointerTarget} from './types'

export interface PointerMoveAction extends PointerTarget {
  pointerName?: string
}

export async function pointerMove(
  {pointerName = 'mouse', target, coords}: PointerMoveAction,
  {pointerState, keyboardState}: inputDeviceState,
): Promise<void> {
  if (!(pointerName in pointerState.position)) {
    throw new Error(
      `Trying to move pointer "${pointerName}" which does not exist.`,
    )
  }

  const {
    pointerId,
    pointerType,
    target: prevTarget,
    coords: prevCoords,
  } = pointerState.position[pointerName]

  if (prevTarget && prevTarget !== target) {
    // Here we could probably calculate a few coords to a fake boundary(?)
    fireMove(prevTarget, prevCoords)

    if (!isDescendantOrSelf(target, prevTarget)) {
      fireLeave(prevTarget, prevCoords)
    }
  }

  if (prevTarget !== target) {
    if (!prevTarget || !isDescendantOrSelf(prevTarget, target)) {
      fireEnter(target, coords)
    }
  }

  // TODO: drag if the target didn't change?

  // Here we could probably calculate a few coords leading up to the final position
  fireMove(target, coords)

  pointerState.position[pointerName] = {pointerId, pointerType, target, coords}

  function fireMove(eventTarget: Element, eventCoords: Coords) {
    fire(eventTarget, 'pointermove', eventCoords)
    if (pointerType === 'mouse') {
      fire(eventTarget, 'mousemove', eventCoords)
    }
  }

  function fireLeave(eventTarget: Element, eventCoords: Coords) {
    fire(eventTarget, 'pointerout', eventCoords)
    fire(eventTarget, 'pointerleave', eventCoords)
    if (pointerType === 'mouse') {
      fire(eventTarget, 'mouseout', eventCoords)
      fire(eventTarget, 'mouseleave', eventCoords)
    }
  }

  function fireEnter(eventTarget: Element, eventCoords: Coords) {
    fire(eventTarget, 'pointerover', eventCoords)
    fire(eventTarget, 'pointerenter', eventCoords)
    if (pointerType === 'mouse') {
      fire(eventTarget, 'mouseover', eventCoords)
      fire(eventTarget, 'mouseenter', eventCoords)
    }
  }

  function fire(eventTarget: Element, type: string, eventCoords: Coords) {
    return firePointerEvent(eventTarget, type, {
      pointerState,
      keyboardState,
      coords: eventCoords,
      pointerId,
      pointerType,
    })
  }
}
