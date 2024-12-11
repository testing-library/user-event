import {PointerCoords} from '../../event'
import {MouseButton} from './buttons'

export interface pointerKey {
  /** Name of the pointer key */
  name: string
  /** Type of the pointer device */
  pointerType: 'mouse' | 'pen' | 'touch'
  /** Type of button */
  button?: MouseButton
}

export interface PointerPosition {
  target?: Element
  coords?: PointerCoords
  caret?: CaretPosition
}

export interface CaretPosition {
  node?: Node
  offset?: number
}

export function isDifferentPointerPosition(
  positionA: PointerPosition,
  positionB: PointerPosition,
) {
  return (
    positionA.target !== positionB.target ||
    positionA.coords?.x !== positionB.coords?.x ||
    positionA.coords?.y !== positionB.coords?.y ||
    positionA.caret?.node !== positionB.caret?.node ||
    positionA.caret?.offset !== positionB.caret?.offset
  )
}
