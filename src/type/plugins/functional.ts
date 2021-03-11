/**
 * This file should contain behavior for functional keys as described here:
 * https://w3c.github.io/uievents-code/#key-alphanumeric-functional
 */

import { fireEvent } from "@testing-library/dom"
import { getKeyEventProps } from "type/getKeyEventProps"
import { behaviorPlugin } from "../types"

const modifierKeys = {
    'Alt': 'alt',
    'CapsLock': 'caps',
    'Control': 'ctrl',
    'Shift': 'shift',
    'OS': 'meta',
} as const

export const preKeydownBehavior: behaviorPlugin[] = [
    // modifierKeys switch on the modifier BEFORE the keydown event
    ...Object.entries(modifierKeys).map(([key, modKey]): behaviorPlugin => ({
        matches: (keyDef) => keyDef.key === key,
        handle: (keyDef, element, options, state) => {
            state.modifiers[modKey] = true
        },
    })),

    // AltGraph produces an extra keydown for Control
    // The modifier does not change
    {
        matches: (keyDef) => keyDef.key === 'AltGraph',
        handle: (keyDef, element, options, state) => {
            const ctrlKeyDef = options.keyboardMap.find(k => k.key === 'Control')
                ?? {key: 'Control', code: 'Control'}
            fireEvent.keyDown(element, getKeyEventProps(ctrlKeyDef, state))
        },
    },
]

export const preKeyupBehavior: behaviorPlugin[] = [
    // modifierKeys switch off the modifier BEFORE the keyup event
    ...Object.entries(modifierKeys).map(([key, modKey]): behaviorPlugin => ({
        matches: (keyDef) => keyDef.key === key,
        handle: (keyDef, element, options, state) => {
            state.modifiers[modKey] = false
        },
    })),
]

export const postKeyupBehavior: behaviorPlugin[] = [
    // AltGraph produces an extra keyup for Control
    // The modifier does not change
    {
        matches: (keyDef) => keyDef.key === 'AltGraph',
        handle: (keyDef, element, options, state) => {
            const ctrlKeyDef = options.keyboardMap.find(k => k.key === 'Control')
                ?? { key: 'Control', code: 'Control' }
            fireEvent.keyUp(element, getKeyEventProps(ctrlKeyDef, state))
        },
    },
]