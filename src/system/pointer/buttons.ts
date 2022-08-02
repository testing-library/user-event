import type {pointerKey} from '.'

export class Buttons {
  private readonly pressed: Record<string, pointerKey[]> = {}

  getButtons() {
    let v = 0
    for (const button of Object.keys(this.pressed)) {
      // eslint-disable-next-line no-bitwise
      v |= 2 ** Number(button)
    }
    return v
  }

  down(keyDef: pointerKey) {
    const button = getMouseButtonId(keyDef.button)

    if (button in this.pressed) {
      this.pressed[button].push(keyDef)
      return undefined
    }

    this.pressed[button] = [keyDef]
    return button
  }

  up(keyDef: pointerKey) {
    const button = getMouseButtonId(keyDef.button)

    if (button in this.pressed) {
      this.pressed[button] = this.pressed[button].filter(
        k => k.name !== keyDef.name,
      )
      if (this.pressed[button].length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this.pressed[button]
        return button
      }
    }

    return undefined
  }
}

export const MouseButton = {
  primary: 0,
  secondary: 1,
  auxiliary: 2,
  back: 3,
  X1: 3,
  forward: 4,
  X2: 4,
} as const
export type MouseButton = keyof typeof MouseButton | number

export function getMouseButtonId(button: MouseButton = 0): number {
  if (button in MouseButton) {
    return MouseButton[button as keyof typeof MouseButton]
  }
  return Number(button)
}

// On the `MouseEvent.button` property auxiliary and secondary button are flipped compared to `MouseEvent.buttons`.
export const MouseButtonFlip = {
  1: 2,
  2: 1,
} as const
export function getMouseEventButton(button?: MouseButton): number {
  button = getMouseButtonId(button)
  if (button in MouseButtonFlip) {
    return MouseButtonFlip[button as keyof typeof MouseButtonFlip]
  }
  return button
}
