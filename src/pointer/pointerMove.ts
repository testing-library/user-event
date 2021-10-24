import {setUISelection} from '../document'
import {
  PointerCoords,
  firePointerEvent,
  isDescendantOrSelf,
  isDisabled,
} from '../utils'
import {resolveSelectionTarget} from './resolveSelectionTarget'
import {inputDeviceState, PointerTarget, SelectionTarget} from './types'

export interface PointerMoveAction extends PointerTarget, SelectionTarget {
  pointerName?: string
}

export async function pointerMove(
  {pointerName = 'mouse', target, coords, node, offset}: PointerMoveAction,
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
    selectionRange,
  } = pointerState.position[pointerName]

  if (prevTarget && prevTarget !== target) {
    // Here we could probably calculate a few coords to a fake boundary(?)
    fireMove(prevTarget, prevCoords)

    if (!isDescendantOrSelf(target, prevTarget)) {
      fireLeave(prevTarget, prevCoords)
    }
  }

  pointerState.position[pointerName] = {
    pointerId,
    pointerType,
    target,
    coords,
    selectionRange,
  }

  if (prevTarget !== target) {
    if (!prevTarget || !isDescendantOrSelf(prevTarget, target)) {
      fireEnter(target, coords)
    }
  }

  // TODO: drag if the target didn't change?

  // Here we could probably calculate a few coords leading up to the final position
  fireMove(target, coords)

  if (selectionRange) {
    const selectionFocus = resolveSelectionTarget({target, node, offset})
    if (
      'node' in selectionRange &&
      selectionFocus.node === selectionRange.node
    ) {
      setUISelection(
        selectionRange.node,
        Math.min(selectionRange.start, selectionFocus.offset),
        Math.max(selectionRange.end, selectionFocus.offset),
      )
    } else if ('setEnd' in selectionRange) {
      const range = selectionRange.cloneRange()
      const cmp = selectionRange.comparePoint(
        selectionFocus.node,
        selectionFocus.offset,
      )
      if (cmp < 0) {
        range.setStart(selectionFocus.node, selectionFocus.offset)
      } else if (cmp > 0) {
        range.setEnd(selectionFocus.node, selectionFocus.offset)
      }

      // TODO: support multiple ranges
      const selection = target.ownerDocument.getSelection() as Selection
      selection.removeAllRanges()
      selection.addRange(range.cloneRange())
    }
  }

  function fireMove(eventTarget: Element, eventCoords?: PointerCoords) {
    fire(eventTarget, 'pointermove', eventCoords)
    if (pointerType === 'mouse' && !isDisabled(eventTarget)) {
      fire(eventTarget, 'mousemove', eventCoords)
    }
  }

  function fireLeave(eventTarget: Element, eventCoords?: PointerCoords) {
    fire(eventTarget, 'pointerout', eventCoords)
    fire(eventTarget, 'pointerleave', eventCoords)
    if (pointerType === 'mouse' && !isDisabled(eventTarget)) {
      fire(eventTarget, 'mouseout', eventCoords)
      fire(eventTarget, 'mouseleave', eventCoords)
    }
  }

  function fireEnter(eventTarget: Element, eventCoords?: PointerCoords) {
    fire(eventTarget, 'pointerover', eventCoords)
    fire(eventTarget, 'pointerenter', eventCoords)
    if (pointerType === 'mouse' && !isDisabled(eventTarget)) {
      fire(eventTarget, 'mouseover', eventCoords)
      fire(eventTarget, 'mouseenter', eventCoords)
    }
  }

  function fire(
    eventTarget: Element,
    type: string,
    eventCoords?: PointerCoords,
  ) {
    return firePointerEvent(eventTarget, type, {
      pointerState,
      keyboardState,
      coords: eventCoords,
      pointerId,
      pointerType,
    })
  }
}
