import { getSelectionRange } from "./getSelectionRange";
import { getValue } from "./getValue";

export function isCursorAtEnd(element: Element) {
    const {selectionStart, selectionEnd} = getSelectionRange(element)

    return selectionStart === selectionEnd &&
        (selectionStart ?? 0) === (getValue(element) ?? '').length
}

export function isCursorAtStart(element: Element) {
    const { selectionStart, selectionEnd } = getSelectionRange(element)

    return selectionStart === selectionEnd &&
        (selectionStart ?? 0) === 0
}
