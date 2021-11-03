import { getUIValue } from "../../document";
import { isContentEditable } from "../edit/isContentEditable";
import { editableInputTypes } from "../edit/isEditable";
import { setSelectionRange } from "../edit/selectionRange";
import { isElementType } from "../misc/isElementType";

/**
 * Expand a selection like the browser does when pressing Ctrl+A.
 */
export function selectAll(target: Element): void {
    if (isElementType(target, 'textarea')
        || isElementType(target, 'input') && target.type in editableInputTypes
    ) {
        return setSelectionRange(target, 0, String(getUIValue(target)).length)
    } else if (target === target.ownerDocument.body || isContentEditable(target)) {
        return setSelectionRange(target, 0, target.childNodes.length)
    }

    // In shadow roots the behavior is undefined.
    // Should never happen.
    /** istanbul ignore if */
    if (!target.parentElement) {
        return
    }

    return selectAll(target.parentElement)
}
