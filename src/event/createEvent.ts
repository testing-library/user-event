import {getWindow} from '../utils'
import {eventMap} from './eventMap'
import {
  type EventType,
  type EventTypeInit,
  type FixedDocumentEventMap,
} from './types'

interface InterfaceMap {
  ClipboardEvent: {type: ClipboardEvent; init: ClipboardEventInit}
  InputEvent: {type: InputEvent; init: InputEventInit}
  MouseEvent: {type: MouseEvent; init: MouseEventInit}
  PointerEvent: {type: PointerEvent; init: PointerEventInit}
  KeyboardEvent: {type: KeyboardEvent; init: KeyboardEventInit}
  FocusEvent: {type: FocusEvent; init: FocusEventInit}
}
type InterfaceNames = typeof eventMap[keyof typeof eventMap]['EventType']
type Interface<k extends InterfaceNames> = k extends keyof InterfaceMap
  ? InterfaceMap[k]
  : never

const eventInitializer: {
  [k in InterfaceNames]: Array<
    (e: Interface<k>['type'], i: Interface<k>['init']) => void
  >
} = {
  ClipboardEvent: [initClipboardEvent],
  Event: [],
  FocusEvent: [initUIEvent, initFocusEvent],
  InputEvent: [initUIEvent, initInputEvent],
  MouseEvent: [initUIEvent, initUIEventModifiers, initMouseEvent],
  PointerEvent: [
    initUIEvent,
    initUIEventModifiers,
    initMouseEvent,
    initPointerEvent,
  ],
  KeyboardEvent: [initUIEvent, initUIEventModifiers, initKeyboardEvent],
}

export function createEvent<K extends EventType>(
  type: K,
  target: Element,
  init?: EventTypeInit<K>,
) {
  const window = getWindow(target)
  const {EventType, defaultInit} = eventMap[type]
  const event = new (getEventConstructors(window)[EventType])(type, defaultInit)
  eventInitializer[EventType].forEach(f =>
    f(event as never, (init ?? {}) as never),
  )

  return event as FixedDocumentEventMap[K]
}

/* istanbul ignore next */
function getEventConstructors(window: Window & typeof globalThis) {
  /* eslint-disable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-extraneous-class */
  const Event = window.Event ?? class Event {}
  const AnimationEvent =
    window.AnimationEvent ?? class AnimationEvent extends Event {}
  const ClipboardEvent =
    window.ClipboardEvent ?? class ClipboardEvent extends Event {}
  const PopStateEvent =
    window.PopStateEvent ?? class PopStateEvent extends Event {}
  const ProgressEvent =
    window.ProgressEvent ?? class ProgressEvent extends Event {}
  const TransitionEvent =
    window.TransitionEvent ?? class TransitionEvent extends Event {}
  const UIEvent = window.UIEvent ?? class UIEvent extends Event {}
  const CompositionEvent =
    window.CompositionEvent ?? class CompositionEvent extends UIEvent {}
  const FocusEvent = window.FocusEvent ?? class FocusEvent extends UIEvent {}
  const InputEvent = window.InputEvent ?? class InputEvent extends UIEvent {}
  const KeyboardEvent =
    window.KeyboardEvent ?? class KeyboardEvent extends UIEvent {}
  const MouseEvent = window.MouseEvent ?? class MouseEvent extends UIEvent {}
  const DragEvent = window.DragEvent ?? class DragEvent extends MouseEvent {}
  const PointerEvent =
    window.PointerEvent ?? class PointerEvent extends MouseEvent {}
  const TouchEvent = window.TouchEvent ?? class TouchEvent extends UIEvent {}
  /* eslint-enable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-extraneous-class */

  return {
    Event,
    AnimationEvent,
    ClipboardEvent,
    PopStateEvent,
    ProgressEvent,
    TransitionEvent,
    UIEvent,
    CompositionEvent,
    FocusEvent,
    InputEvent,
    KeyboardEvent,
    MouseEvent,
    DragEvent,
    PointerEvent,
    TouchEvent,
  }
}

function assignProps<T extends object>(obj: T, props: {[k in keyof T]?: T[k]}) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(obj, key, {get: () => value ?? null})
  }
}

function sanitizeNumber(n: number | undefined) {
  return Number(n ?? 0)
}

function initClipboardEvent(
  event: ClipboardEvent,
  {clipboardData}: ClipboardEventInit,
) {
  assignProps(event, {
    clipboardData,
  })
}

function initFocusEvent(event: FocusEvent, {relatedTarget}: FocusEventInit) {
  assignProps(event, {
    relatedTarget,
  })
}

function initInputEvent(
  event: InputEvent,
  {data, inputType, isComposing}: InputEventInit,
) {
  assignProps(event, {
    data,
    isComposing: Boolean(isComposing),
    inputType: String(inputType),
  })
}

function initUIEvent(event: UIEvent, {view, detail}: UIEventInit) {
  assignProps(event, {
    view,
    detail: sanitizeNumber(detail ?? 0),
  })
}

function initUIEventModifiers(
  event: KeyboardEvent | MouseEvent,
  {
    altKey,
    ctrlKey,
    metaKey,
    shiftKey,
    modifierAltGraph,
    modifierCapsLock,
    modifierFn,
    modifierFnLock,
    modifierNumLock,
    modifierScrollLock,
    modifierSymbol,
    modifierSymbolLock,
  }: EventModifierInit,
) {
  assignProps(event, {
    altKey: Boolean(altKey),
    ctrlKey: Boolean(ctrlKey),
    metaKey: Boolean(metaKey),
    shiftKey: Boolean(shiftKey),
    getModifierState(k: string) {
      return Boolean(
        {
          Alt: altKey,
          AltGraph: modifierAltGraph,
          CapsLock: modifierCapsLock,
          Control: ctrlKey,
          Fn: modifierFn,
          FnLock: modifierFnLock,
          Meta: metaKey,
          NumLock: modifierNumLock,
          ScrollLock: modifierScrollLock,
          Shift: shiftKey,
          Symbol: modifierSymbol,
          SymbolLock: modifierSymbolLock,
        }[k],
      )
    },
  })
}

function initKeyboardEvent(
  event: KeyboardEvent,
  {
    key,
    code,
    location,
    repeat,
    isComposing,
    charCode, // `charCode` is necessary for React17 `keypress`
  }: KeyboardEventInit,
) {
  assignProps(event, {
    key: String(key),
    code: String(code),
    location: sanitizeNumber(location),
    repeat: Boolean(repeat),
    isComposing: Boolean(isComposing),
    charCode,
  })
}

function initMouseEvent(
  event: MouseEvent,
  {
    x,
    y,
    screenX,
    screenY,
    clientX = x,
    clientY = y,
    button,
    buttons,
    relatedTarget,
    offsetX,
    offsetY,
    pageX,
    pageY,
  }: MouseEventInit &
    Partial<
      Pick<MouseEvent, 'x' | 'y' | 'offsetX' | 'offsetY' | 'pageX' | 'pageY'>
    >,
) {
  assignProps(event, {
    screenX: sanitizeNumber(screenX),
    screenY: sanitizeNumber(screenY),
    clientX: sanitizeNumber(clientX),
    x: sanitizeNumber(clientX),
    clientY: sanitizeNumber(clientY),
    y: sanitizeNumber(clientY),
    button: sanitizeNumber(button),
    buttons: sanitizeNumber(buttons),
    relatedTarget,
    offsetX: sanitizeNumber(offsetX),
    offsetY: sanitizeNumber(offsetY),
    pageX: sanitizeNumber(pageX),
    pageY: sanitizeNumber(pageY),
  })
}

function initPointerEvent(
  event: PointerEvent,
  {
    pointerId,
    width,
    height,
    pressure,
    tangentialPressure,
    tiltX,
    tiltY,
    twist,
    pointerType,
    isPrimary,
  }: PointerEventInit,
) {
  assignProps(event, {
    pointerId: sanitizeNumber(pointerId),
    width: sanitizeNumber(width ?? 1),
    height: sanitizeNumber(height ?? 1),
    pressure: sanitizeNumber(pressure),
    tangentialPressure: sanitizeNumber(tangentialPressure),
    tiltX: sanitizeNumber(tiltX),
    tiltY: sanitizeNumber(tiltY),
    twist: sanitizeNumber(twist),
    pointerType: String(pointerType),
    isPrimary: Boolean(isPrimary),
  })
}
