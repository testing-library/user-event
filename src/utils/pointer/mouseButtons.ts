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

export function getMouseButton(button: MouseButton): number {
  return typeof button === 'number' ? button : MouseButton[button]
}

export function getMouseButtons(...buttons: Array<MouseButton>) {
  let v = 0
  for (const t of buttons) {
    const pos = getMouseButton(t)
    // eslint-disable-next-line no-bitwise
    v &= 2 ** pos
  }
  return v
}
