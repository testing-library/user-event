// See : https://github.com/testing-library/react-testing-library/issues/268

export interface FakeEventInit extends MouseEventInit, PointerEventInit {
  x?: number
  y?: number
  clientX?: number
  clientY?: number
  offsetX?: number
  offsetY?: number
  pageX?: number
  pageY?: number
}

function assignProps(obj: MouseEvent | PointerEvent, props: FakeEventInit) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(obj, key, {get: () => value})
  }
}

function assignPositionInit(
  obj: MouseEvent | PointerEvent,
  {x, y, clientX, clientY, offsetX, offsetY, pageX, pageY}: FakeEventInit,
) {
  assignProps(obj, {
    x,
    y,
    clientX,
    clientY,
    offsetX,
    offsetY,
    pageX,
    pageY,
  })
}

function assignPointerInit(
  obj: MouseEvent | PointerEvent,
  {isPrimary, pointerId, pointerType}: FakeEventInit,
) {
  assignProps(obj, {
    isPrimary,
    pointerId,
    pointerType,
  })
}

const notBubbling = ['mouseover', 'mouseout', 'pointerover', 'pointerout']

function getInitDefaults(type: string, init: FakeEventInit): FakeEventInit {
  return {
    bubbles: !notBubbling.includes(type),
    cancelable: true,
    composed: true,
    ...init,
  }
}

export class FakeMouseEvent extends MouseEvent {
  constructor(type: string, init: FakeEventInit) {
    super(type, getInitDefaults(type, init))
    assignPositionInit(this, init)
  }
}

// Should extend PointerEvent, but... https://github.com/jsdom/jsdom/issues/2527
export class FakePointerEvent extends MouseEvent {
  constructor(type: string, init: FakeEventInit) {
    super(type, getInitDefaults(type, init))
    assignPositionInit(this, init)
    assignPointerInit(this, init)
  }
}
