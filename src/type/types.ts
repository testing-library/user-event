export type keyboardState = {
  /*
      All keys that have been pressed and not been lifted up yet.
    */
  pressed: keyboardKey[]

  /*
      Active modifiers
    */
  modifiers: {
    alt: boolean
    caps: boolean
    ctrl: boolean
    meta: boolean
    shift: boolean
  }

  /*
      The element the keyboard input is performed on.
      Some behavior might differ if the activeElement changes between corresponding keyboard events.
    */
  activeElement: Element | null

  /*
      For HTMLInputElements type='number':
      If the last input char is '.', '-' or 'e',
      the IDL value attribute does not reflect the input value.
    */
  carryChar: string
}

export type modernTypeOptions = {
  /* Delay between keystrokes */
  delay: number
  /* Do not automatically add keyup events for opened modifiers */
  skipAutoClose: boolean
  /* Add modifiers for given keys */
  autoModify: boolean
  /* Keyboard layout to use */
  keyboardMap: keyboardKey[]
}

export enum DOM_KEY_LOCATION {
  STANDARD = 0,
  LEFT = 1,
  RIGHT = 2,
  NUMPAD = 3,
}

export interface keyboardKey {
  /* Physical location on a keyboard */
  code?: string
  /* Character or functional key descriptor */
  key?: string
  /* Location on the keyboard for keys with multiple representation */
  location?: DOM_KEY_LOCATION
  /* Does the character in `key` require/imply AltRight to be pressed? */
  altGr?: boolean
  /* Does the character in `key` require/imply a shiftKey to be pressed? */
  shift?: boolean
}

export interface behaviorPlugin {
  matches: (keyDef: keyboardKey, element: Element, options: modernTypeOptions, state: keyboardState) => boolean,
  handle: (keyDef: keyboardKey, element: Element, options: modernTypeOptions, state: keyboardState) => void,
}
