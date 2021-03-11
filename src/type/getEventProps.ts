import { keyboardKey, keyboardState } from "./types";

export function getKeyEventProps(
    keyDef: keyboardKey,
    state: keyboardState,
) {
    return {
        key: keyDef.key,
        code: keyDef.code,
        altKey: state.modifiers.alt,
        ctrlKey: state.modifiers.ctrl,
        metaKey: state.modifiers.meta,
        shiftKey: state.modifiers.shift,

        // deprecated
        keyCode: keyDef.keyCode ?? (keyDef.key?.length === 1 ? keyDef.key.charCodeAt(0) : undefined),
    }
}

export function getMouseEventProps(
    state: keyboardState,
) {
    return {
        altKey: state.modifiers.alt,
        ctrlKey: state.modifiers.ctrl,
        metaKey: state.modifiers.meta,
        shiftKey: state.modifiers.shift,
    }
}
