/**
 * This file should contain behavior for functional keys as described here:
 * https://w3c.github.io/uievents-code/#key-alphanumeric-functional
 */

import { fireEvent } from "@testing-library/dom"
import { getValue, isClickableInput, isInstanceOfElement } from "../../utils"
import { getKeyEventProps, getMouseEventProps } from "../getEventProps"
import { fireInputEventIfNeeded } from "../shared"
import { behaviorPlugin } from "../types"
import { calculateNewBackspaceValue } from "./functional/calculateBackspaceValue"

const modifierKeys = {
    'Alt': 'alt',
    'Control': 'ctrl',
    'Shift': 'shift',
    'Meta': 'meta',
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

export const keydownBehavior: behaviorPlugin[] = [
    {
        matches: (keyDef) => keyDef.key === 'CapsLock',
        handle: (keyDef, element, options, state) => {
            state.modifiers.caps = !state.modifiers.caps
        }
    },
    {
        matches: (keyDef) => keyDef.key === 'Backspace',
        handle: (keyDef, element, options, state) => {
            const { newValue, newSelectionStart } = calculateNewBackspaceValue(element, state.carryValue)

            fireInputEventIfNeeded({
                newValue,
                newSelectionStart,
                eventOverrides: {
                    inputType: 'deleteContentBackward',
                },
                currentElement: () => element,
            })

            if (state.carryValue) {
                state.carryValue = getValue(element) === newValue ? undefined : newValue
            }
        }
    },
]

export const keypressBehavior: behaviorPlugin[] = [
    {
        matches: (keyDef, element) => keyDef.key === 'Enter' && (isClickableInput(element) ||
            // Links with href defined should handle Enter the same as a click
            isInstanceOfElement(element, 'HTMLAnchorElement') &&
                Boolean((element as HTMLAnchorElement).href)
        ),
        handle: (keyDef, element, options, state) => {
            fireEvent.click(element, getMouseEventProps(state))
        },
    },
    {
        matches: (keyDef, element) => keyDef.key === 'Enter' && isInstanceOfElement(element, 'HTMLInputElement'),
        handle: (keyDef, element) => {
            const form = (element as HTMLInputElement).form

            if (form && (
                form.querySelectorAll('input').length === 1 ||
                form.querySelector('input[type="submit"]') ||
                form.querySelector('button[type="submit"]')
            )){
                fireEvent.submit(form)
            }
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

export const keyupBehavior: behaviorPlugin[] = [
    {
        matches: (keyDef, element) => keyDef.key === ' ' && isClickableInput(element),
        handle: (keyDef, element, options, state) => {
            fireEvent.click(element, getMouseEventProps(state))
        },
    },
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