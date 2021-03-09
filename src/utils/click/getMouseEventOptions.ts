function isMousePressEvent(event: string) {
  return (
    event === 'mousedown' ||
    event === 'mouseup' ||
    event === 'click' ||
    event === 'dblclick'
  )
}

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
const BUTTONS_NAMES = {
  none: 0,
  primary: 1,
  secondary: 2,
  auxiliary: 4,
} as const

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const BUTTON_NAMES = {
  primary: 0,
  auxiliary: 1,
  secondary: 2,
} as const

function translateButtonNumber(value: number, from: 'buttons' | 'button') {
  const [mapIn, mapOut] =
    from === 'button'
      ? [BUTTON_NAMES, BUTTONS_NAMES]
      : [BUTTONS_NAMES, BUTTON_NAMES]

  const name = Object.entries(mapIn).find(([, i]) => i === value)?.[0]

  // istanbul ignore next
  return name && Object.prototype.hasOwnProperty.call(mapOut, name)
    ? mapOut[name as keyof typeof mapOut]
    : 0
}

function convertMouseButtons(
  event: string,
  init: MouseEventInit,
  property: 'buttons' | 'button',
): number {
  if (!isMousePressEvent(event)) {
    return 0
  }

  if (typeof init[property] === 'number') {
    return init[property] as number
  } else if (property === 'button' && typeof init.buttons === 'number') {
    return translateButtonNumber(init.buttons, 'buttons')
  } else if (property === 'buttons' && typeof init.button === 'number') {
    return translateButtonNumber(init.button, 'button')
  }

  return property != 'button' && isMousePressEvent(event) ? 1 : 0
}

export function getMouseEventOptions(
  event: string,
  init?: MouseEventInit,
  clickCount = 0,
) {
  init = init ?? {}
  return {
    ...init,
    // https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail
    detail:
      event === 'mousedown' || event === 'mouseup' || event === 'click'
        ? 1 + clickCount
        : clickCount,
    buttons: convertMouseButtons(event, init, 'buttons'),
    button: convertMouseButtons(event, init, 'button'),
  }
}
