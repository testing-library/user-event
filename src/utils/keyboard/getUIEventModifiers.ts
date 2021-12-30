import type {keyboardState} from '../../keyboard'

export function getUIEventModifiers(keyboardState: keyboardState) {
  return {
    altKey: keyboardState.modifiers.Alt,
    ctrlKey: keyboardState.modifiers.Control,
    metaKey: keyboardState.modifiers.Meta,
    shiftKey: keyboardState.modifiers.Shift,
    modifierAltGraph: keyboardState.modifiers.AltGraph,
    modifierCapsLock: keyboardState.modifiers.CapsLock,
    modifierFn: keyboardState.modifiers.Fn,
    modifierFnLock: keyboardState.modifiers.FnLock,
    modifierNumLock: keyboardState.modifiers.NumLock,
    modifierScrollLock: keyboardState.modifiers.ScrollLock,
    modifierSymbol: keyboardState.modifiers.Symbol,
    modifierSymbolLock: keyboardState.modifiers.SymbolLock,
  }
}
