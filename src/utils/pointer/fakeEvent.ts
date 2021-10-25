// See : https://github.com/testing-library/react-testing-library/issues/268

export interface PointerCoords {
  x?: number
  y?: number
  clientX?: number
  clientY?: number
  offsetX?: number
  offsetY?: number
  pageX?: number
  pageY?: number
  screenX?: number
  screenY?: number
}

export interface FakePointerEventInit
  extends MouseEventInit,
    PointerEventInit,
    PointerCoords {}

function assignProps(
  obj: MouseEvent | PointerEvent,
  props: FakePointerEventInit,
) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(obj, key, {get: () => value})
  }
}

function assignPositionInit(
  obj: MouseEvent | PointerEvent,
  {
    x,
    y,
    clientX,
    clientY,
    offsetX,
    offsetY,
    pageX,
    pageY,
    screenX,
    screenY,
  }: FakePointerEventInit,
) {
  assignProps(obj, {
    /* istanbul ignore start */
    x: x ?? clientX ?? 0,
    y: y ?? clientY ?? 0,
    clientX: x ?? clientX ?? 0,
    clientY: y ?? clientY ?? 0,
    offsetX: offsetX ?? 0,
    offsetY: offsetY ?? 0,
    pageX: pageX ?? 0,
    pageY: pageY ?? 0,
    screenX: screenX ?? 0,
    screenY: screenY ?? 0,
    /* istanbul ignore end */
  })
}

function assignPointerInit(
  obj: MouseEvent | PointerEvent,
  {isPrimary, pointerId, pointerType}: FakePointerEventInit,
) {
  assignProps(obj, {
    isPrimary,
    pointerId,
    pointerType,
  })
}

const notBubbling = ['mouseenter', 'mouseleave', 'pointerenter', 'pointerleave']

function getInitDefaults(
  type: string,
  init: FakePointerEventInit,
): FakePointerEventInit {
  return {
    bubbles: !notBubbling.includes(type),
    cancelable: true,
    composed: true,
    ...init,
  }
}

export class FakeMouseEvent extends MouseEvent {
  constructor(type: string, init: FakePointerEventInit) {
    super(type, getInitDefaults(type, init))
    assignPositionInit(this, init)
  }
}

// Should extend PointerEvent, but... https://github.com/jsdom/jsdom/issues/2527
export class FakePointerEvent extends MouseEvent {
  constructor(type: string, init: FakePointerEventInit) {
    super(type, getInitDefaults(type, init))
    assignPositionInit(this, init)
    assignPointerInit(this, init)
  }
}
