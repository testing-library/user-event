/**
 * This file should contain behavior for arrow keys as described here:
 * https://w3c.github.io/uievents-code/#key-controlpad-section
 */

import { behaviorPlugin } from "../types";
import { getValue, isContentEditable, isInstanceOfElement, setSelectionRangeIfNecessary } from "../../utils";
import { fireInputEventIfNeeded } from "../shared";
import { calculateNewDeleteValue } from "./control/calculateNewDeleteValue";

export const keydownBehavior: behaviorPlugin[] = [
    {
        matches: (keyDef, element) => (keyDef.key === 'Home' || keyDef.key === 'End') && (
            isInstanceOfElement(element, 'HTMLInputElement')
            || isInstanceOfElement(element, 'HTMLTextAreaElement')
            || isContentEditable(element)
        ),
        handle: (keyDef, element) => {
            // This could probably been improved by collapsing a selection range
            if (keyDef.key === 'Home') {
                setSelectionRangeIfNecessary(element, 0, 0)
            } else if (keyDef.key === 'End') {
                const newPos = getValue(element)?.length ?? 0
                setSelectionRangeIfNecessary(element, newPos, newPos)
            }
        },
    },
    {
        matches: (keyDef) => keyDef.key === 'Delete',
        handle: (keDef, element) => {
            fireInputEventIfNeeded({
                ...calculateNewDeleteValue(element),
                eventOverrides: {
                    inputType: 'deleteContentForward',
                },
                currentElement: () => element,
            })

        },
    },
]
