import {dispatchDOMEvent} from '../event'
import {getActiveElement} from '../utils'

const patched = Symbol('patched focus/blur methods')

declare global {
  interface HTMLElement {
    readonly [patched]?: Pick<HTMLElement, 'focus' | 'blur'>
  }
}

export function patchFocus(HTMLElement: typeof globalThis['HTMLElement']) {
  if (HTMLElement.prototype[patched]) {
    return
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
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

  function patchedFocus(this: HTMLElement, options: FocusOptions) {
    if (this.ownerDocument.visibilityState !== 'hidden') {
      return focus.call(this, options)
    }

    const blurred = getActiveTarget(this.ownerDocument)
    if (blurred === this) {
      return
    }

    const thisCall = Symbol('focus call')
    activeCall = thisCall

    if (blurred) {
      blur.call(blurred)
      dispatchDOMEvent(blurred, 'blur', {relatedTarget: this})
      dispatchDOMEvent(blurred, 'focusout', {
        relatedTarget: activeCall === thisCall ? this : null,
      })
    }
    if (activeCall === thisCall) {
      focus.call(this, options)
      dispatchDOMEvent(this, 'focus', {relatedTarget: blurred})
    }
    if (activeCall === thisCall) {
      dispatchDOMEvent(this, 'focusin', {relatedTarget: blurred})
    }
  }

  function patchedBlur(this: HTMLElement) {
    if (this.ownerDocument.visibilityState !== 'hidden') {
      return blur.call(this)
    }

    const blurred = getActiveTarget(this.ownerDocument)
    if (blurred !== this) {
      return
    }

    const thisCall = Symbol('blur call')
    activeCall = thisCall

    blur.call(this)
    dispatchDOMEvent(blurred, 'blur', {relatedTarget: null})
    dispatchDOMEvent(blurred, 'focusout', {relatedTarget: null})
  }
}

function getActiveTarget(document: Document) {
  const active = getActiveElement(document)
  return active?.tagName === 'BODY' ? null : active
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
