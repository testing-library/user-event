import { dispatchDOMEvent } from '../event'
import { getActiveElement } from '../utils'

const patched = Symbol('patched focus/blur methods')

declare global {
    interface HTMLElement {
        readonly [patched]?: Pick<HTMLElement, 'focus'|'blur'>
    }
}

export function patchFocus(HTMLElement: typeof globalThis['HTMLElement']) {
    if (HTMLElement.prototype[patched]) {
        return
    }

    const {focus, blur} = HTMLElement.prototype

    Object.defineProperties(HTMLElement.prototype, {
        focus: {
            configurable: true,
            get: () => patchedFocus,
        },
        blur: {
            configurable: true,
            get: () => patchedBlur,
        },
        [patched]: {
            configurable: true,
            get: () => ({focus, blur}),
        },
    })

    let activeCall: symbol

    function patchedFocus(
        this: HTMLElement,
        options: FocusOptions,
    ) {
        const thisCall = Symbol()
        activeCall = thisCall

        if (this.ownerDocument.visibilityState === 'hidden') {
            const blured = getActiveElement(this.ownerDocument)
            if (blured === this) {
                return
            }

            if (blured) {
                blur.call(blured)
                dispatchDOMEvent(blured, 'blur', {relatedTarget: this})
                dispatchDOMEvent(blured, 'focusout', {
                    relatedTarget: activeCall === thisCall
                        ? this
                        : null,
                })
            }
            if (activeCall === thisCall) {
                focus.call(this, options)
                dispatchDOMEvent(this, 'focus', {relatedTarget: blured})
            }
            if (activeCall === thisCall) {
                dispatchDOMEvent(this, 'focusin', {relatedTarget: blured})
            }
        } else {
            focus.call(this, options)
        }
    }

    function patchedBlur(
        this: HTMLElement,
    ) {
        if (this.ownerDocument.visibilityState === 'hidden') {
            const blured = getActiveElement(this.ownerDocument)
            if (blured !== this) {
                return
            }

            const thisCall = Symbol()
            activeCall = thisCall

            blur.call(this)
            dispatchDOMEvent(blured, 'blur', {relatedTarget: null})
            if (activeCall === thisCall) {
                dispatchDOMEvent(blured, 'focusout', {relatedTarget: null})
            }
        } else {
            blur.call(this)
        }
    }
}

export function restoreFocus(HTMLElement: typeof globalThis['HTMLElement']) {
    if (HTMLElement.prototype[patched]) {
        const {focus, blur} = HTMLElement.prototype[patched]
        Object.defineProperties(HTMLElement.prototype, {
            focus: {
                configurable: true,
                get: () => focus,
            },
            blur: {
                configurable: true,
                get: () => blur,
            },
        })
    }
}