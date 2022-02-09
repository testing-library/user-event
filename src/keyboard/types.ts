/**
 * @internal Do not create/alter this by yourself as this type might be subject to changes.
 */
export type keyboardState = {
  /**
      All keys that have been pressed and not been lifted up yet.
    */
  pressed: {keyDef: keyboardKey; unpreventedDefault: boolean}[]

  /**
      Active modifiers
    */
  modifiers: {
    Alt: boolean
    AltGraph: boolean
    CapsLock: boolean
    Control: boolean
    Fn: boolean
    FnLock: boolean
    Meta: boolean
    NumLock: boolean
    ScrollLock: boolean
    Shift: boolean
    Symbol: boolean
    SymbolLock: boolean
  }
  modifierPhase: {
    CapsLock?: boolean
    FnLock?: boolean
    NumLock?: boolean
    ScrollLock?: boolean
    SymbolLock?: boolean
  }

  /**
      The element the keyboard input is performed on.
      Some behavior might differ if the activeElement changes between corresponding keyboard events.
    */
  activeElement: Element | null

  /**
      For HTMLInputElements type='number':
      If the last input char is '.', '-' or 'e',
      the IDL value attribute does not reflect the input value.

      @deprecated The document state workaround in `src/document/value.ts` keeps track
      of UI value diverging from value property.
    */
  carryValue?: string

  /**
      Carry over characters to following key handlers.
      E.g. ^1
    */
  carryChar: string
}

export enum DOM_KEY_LOCATION {
  STANDARD = 0,
  LEFT = 1,
  RIGHT = 2,
  NUMPAD = 3,
}

export interface keyboardKey {
  /** Physical location on a keyboard */
  code?: string
  /** Character or functional key descriptor */
  key?: string
  /** Location on the keyboard for keys with multiple representation */
  location?: DOM_KEY_LOCATION
  /** Does the character in `key` require/imply AltRight to be pressed? */
  altGr?: boolean
  /** Does the character in `key` require/imply a shiftKey to be pressed? */
  shift?: boolean
}
