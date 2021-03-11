/**
 * This file should contain behavior for arrow keys as described here:
 * https://w3c.github.io/uievents-code/#key-arrowpad-section
 */

import { behaviorPlugin } from "../types";
import { isInstanceOfElement, setSelectionRangeIfNecessary } from "../../utils";

export const keydownBehavior: behaviorPlugin[] = [
    {
        matches: (keyDef, element) => (keyDef.key === 'ArrowLeft' || keyDef.key === 'ArrowRight') && isInstanceOfElement(element, 'HTMLInputElement'),
        handle: (keyDef, element) => {
            const { selectionStart, selectionEnd } = element as HTMLInputElement

            const direction = keyDef.key === 'ArrowLeft' ? -1 : 1

            const newPos = (selectionStart === selectionEnd
                ? (selectionStart ?? 0) + direction
                : direction < 0 ? selectionStart : selectionEnd
            ) ?? 0

            setSelectionRangeIfNecessary(element, newPos, newPos)
        }
    },
]
