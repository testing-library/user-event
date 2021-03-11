/**
 * This file should cover the behavior for keys that produce character input
 */

import { fireEvent } from "@testing-library/dom";
import { getKeyEventProps } from "type/getKeyEventProps";
import { fireChangeForInputTimeIfValid, fireInputEventIfNeeded } from "type/shared";
import { behaviorPlugin } from "type/types";
import { buildTimeValue, calculateNewValue, getValue, isContentEditable, isInstanceOfElement, isValidDateValue, isValidInputTimeValue } from "utils";

export const keydownBehavior: behaviorPlugin[] = [
    {
        matches: (keyDef, element) => keyDef.key?.length === 1 && (
            isInstanceOfElement(element, 'HTMLInputElement')
            || isInstanceOfElement(element, 'HTMLTextAreaElement')
            || isContentEditable(element)
        ),
        handle: (keyDef, element, options, state) => {
            const keyPressResult = fireEvent.keyPress(element, getKeyEventProps(keyDef, state))
            if (!keyPressResult) {
                return
            }

            const isInputElement = isInstanceOfElement(element, 'HTMLInputElement')

            const oldValue = getValue(element) ?? ''
            let newTypeValue = state.carryChar + (keyDef.key as string)

            if (isInputElement && (element as HTMLInputElement).type === 'time') {
                const timeNewEntry = buildTimeValue(newTypeValue)
                if (isValidInputTimeValue(element, timeNewEntry)) {
                    newTypeValue = timeNewEntry
                }
            }

            const { newValue, newSelectionStart } = calculateNewValue(newTypeValue, element as HTMLElement)

            fireInputEventIfNeeded({
                newValue,
                newSelectionStart,
                eventOverrides: {
                    data: keyDef.key,
                    inputType: 'insertText',
                },
                currentElement: () => element,
            })

            if (isInputElement
                && (element as HTMLInputElement).type === 'date'
                && isValidDateValue(element, newValue)
            ) {
                fireEvent.change(element, {
                    target: { value: newValue },
                })
            }
            fireChangeForInputTimeIfValid(() => element, oldValue, newTypeValue)

            if (newValue === oldValue) {
                state.carryChar += keyDef.key
            } else {
                state.carryChar = ''
            }
        },
    }
]