import {type Instance} from '../setup'
import {getActiveElementOrBody} from '../utils'
import {type System} from '.'

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

const modifierKeys = [
  'Alt',
  'AltGraph',
  'Control',
  'Fn',
  'Meta',
  'Shift',
  'Symbol',
] as const
type ModififierKey = typeof modifierKeys[number]

function isModifierKey(key?: string): key is ModififierKey {
  return modifierKeys.includes(key as ModififierKey)
}

const modifierLocks = [
  'CapsLock',
  'FnLock',
  'NumLock',
  'ScrollLock',
  'SymbolLock',
] as const
type ModififierLockKey = typeof modifierLocks[number]

function isModifierLock(key?: string): key is ModififierLockKey {
  return modifierLocks.includes(key as ModififierLockKey)
}

export class KeyboardHost {
  readonly system: System

  constructor(system: System) {
    this.system = system
  }
  readonly modifiers = {
    Alt: false,
    AltGraph: false,
    CapsLock: false,
    Control: false,
    Fn: false,
    FnLock: false,
    Meta: false,
    NumLock: false,
    ScrollLock: false,
    Shift: false,
    Symbol: false,
    SymbolLock: false,
  }
  private readonly pressed = new (class {
    registry: {
      [k in string]?: {
        keyDef: keyboardKey
        unpreventedDefault: boolean
      }
    } = {}
    add(code: string, keyDef: keyboardKey) {
      this.registry[code] ??= {
        keyDef,
        unpreventedDefault: false,
      }
    }
    has(code: string) {
      return !!this.registry[code]
    }
    setUnprevented(code: string) {
      const o = this.registry[code]
      if (o) {
        o.unpreventedDefault = true
      }
    }
    isUnprevented(code: string) {
      return !!this.registry[code]?.unpreventedDefault
    }
    delete(code: string) {
      delete this.registry[code]
    }
    values() {
      return Object.values(this.registry) as NonNullable<
        typeof this.registry[string]
      >[]
    }
  })()
  carryChar = ''
  private lastKeydownTarget: Element | undefined = undefined
  private readonly modifierLockStart: Record<string, boolean> = {}

  isKeyPressed(keyDef: keyboardKey) {
    return this.pressed.has(String(keyDef.code))
  }

  getPressedKeys() {
    return this.pressed.values().map(p => p.keyDef)
  }

  /** Press a key */
  async keydown(instance: Instance, keyDef: keyboardKey) {
    const key = String(keyDef.key)
    const code = String(keyDef.code)

    const target = getActiveElementOrBody(instance.config.document)
    this.setKeydownTarget(target)

    this.pressed.add(code, keyDef)

    if (isModifierKey(key)) {
      this.modifiers[key] = true
    }

    const unprevented = instance.dispatchUIEvent(target, 'keydown', {
      key,
      code,
    })

    if (isModifierLock(key) && !this.modifiers[key]) {
      this.modifiers[key] = true
      this.modifierLockStart[key] = true
    }

    if (unprevented) {
      this.pressed.setUnprevented(code)
    }

    if (unprevented && this.hasKeyPress(key)) {
      instance.dispatchUIEvent(
        getActiveElementOrBody(instance.config.document),
        'keypress',
        {
          key,
          code,
          charCode:
            keyDef.key === 'Enter' ? 13 : String(keyDef.key).charCodeAt(0),
        },
      )
    }
  }

  /** Release a key */
  async keyup(instance: Instance, keyDef: keyboardKey) {
    const key = String(keyDef.key)
    const code = String(keyDef.code)

    const unprevented = this.pressed.isUnprevented(code)

    this.pressed.delete(code)

    if (
      isModifierKey(key) &&
      !this.pressed.values().find(p => p.keyDef.key === key)
    ) {
      this.modifiers[key] = false
    }

    instance.dispatchUIEvent(
      getActiveElementOrBody(instance.config.document),
      'keyup',
      {
        key,
        code,
      },
      !unprevented,
    )

    if (isModifierLock(key) && this.modifiers[key]) {
      if (this.modifierLockStart[key]) {
        this.modifierLockStart[key] = false
      } else {
        this.modifiers[key] = false
      }
    }
  }

  private setKeydownTarget(target: Element) {
    if (target !== this.lastKeydownTarget) {
      this.carryChar = ''
    }
    this.lastKeydownTarget = target
  }

  private hasKeyPress(key: string) {
    return (
      (key.length === 1 || key === 'Enter') &&
      !this.modifiers.Control &&
      !this.modifiers.Alt
    )
  }
}
