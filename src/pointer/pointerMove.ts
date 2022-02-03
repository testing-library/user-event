import {setUISelection} from '../document'
import {EventType, PointerCoords} from '../event'
import {Config} from '../setup'
import {
  isDescendantOrSelf,
  isDisabled,
  assertPointerEvents,
  setLevelRef,
  ApiLevel,
} from '../utils'
import {firePointerEvent} from './firePointerEvents'
import {resolveSelectionTarget} from './resolveSelectionTarget'
import {PointerTarget, SelectionTarget} from './types'

export interface PointerMoveAction extends PointerTarget, SelectionTarget {
  pointerName?: string
}

export async function pointerMove(
  config: Config,
  {pointerName = 'mouse', target, coords, node, offset}: PointerMoveAction,
): Promise<void> {
  const {pointerState} = config
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
    setLevelRef(config, ApiLevel.Trigger)
    assertPointerEvents(config, prevTarget)

    // Here we could probably calculate a few coords to a fake boundary(?)
    fireMove(prevTarget, prevCoords)

    if (!isDescendantOrSelf(target, prevTarget)) {
      fireLeave(prevTarget, prevCoords)
    }
  }

  setLevelRef(config, ApiLevel.Trigger)
  assertPointerEvents(config, target)

  pointerState.position[pointerName] = {
    ...pointerState.position[pointerName],
    target,
    coords,
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
    // TODO: support extending range (shift)

    const selectionFocus = resolveSelectionTarget({target, node, offset})
    if ('node' in selectionRange) {
      // When the mouse is dragged outside of an input/textarea,
      // the selection is extended to the beginning or end of the input
      // depending on pointer position.
      // TODO: extend selection according to pointer position
      /* istanbul ignore else */
      if (selectionFocus.node === selectionRange.node) {
        const anchorOffset =
          selectionFocus.offset < selectionRange.start
            ? selectionRange.end
            : selectionRange.start
        const focusOffset =
          selectionFocus.offset > selectionRange.end ||
          selectionFocus.offset < selectionRange.start
            ? selectionFocus.offset
            : selectionRange.end

        setUISelection(selectionRange.node, {anchorOffset, focusOffset})
      }
    } else {
      const range = selectionRange.cloneRange()

      const cmp = range.comparePoint(selectionFocus.node, selectionFocus.offset)
      if (cmp < 0) {
        range.setStart(selectionFocus.node, selectionFocus.offset)
      } else if (cmp > 0) {
        range.setEnd(selectionFocus.node, selectionFocus.offset)
      }

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
    type: EventType,
    eventCoords?: PointerCoords,
  ) {
    return firePointerEvent(config, eventTarget, type, {
      coords: eventCoords,
      pointerId,
      pointerType,
    })
  }
}
