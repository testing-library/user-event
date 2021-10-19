import {Coords, MouseButton} from '../utils'

/**
 * @internal Do not create/alter this by yourself as this type might be subject to changes.
 */
export type pointerState = {
  /**
        All keys that have been pressed and not been lifted up yet.
      */
  pressed: {
    keyDef: pointerKey
    pointerId: number
    isMultiTouch: boolean
    isPrimary: boolean
    clickCount: number
    unpreventedDefault: boolean
    /** Target the key was pressed on */
    downTarget: Element
  }[]

  activeClickCount?: [string, number]

  /**
   * Position of each pointer.
   * The mouse is always pointer 1 and keeps its position.
   * Pen and touch devices receive a new pointerId for every interaction.
   */
  position: Record<
    string,
    {
      pointerId: number
      pointerType: 'mouse' | 'pen' | 'touch'
      target?: Element
      coords: Coords
    }
  >

  /**
   * Last applied pointer id
   */
  pointerId: number
}

export type pointerOptions = {
  /** Delay between keystrokes */
  delay: number
  /** Available pointer keys */
  pointerMap: pointerKey[]
}

export interface pointerKey {
  /** Name of the pointer key */
  name: string
  /** Type of the pointer device */
  pointerType: 'mouse' | 'pen' | 'touch'
  /** Type of button */
  button?: MouseButton
}

export interface PointerTarget {
  target: Element
  coords: Coords
}
