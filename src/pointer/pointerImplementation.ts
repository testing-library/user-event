import {fireEvent} from '@testing-library/dom'
import {getMouseButton, getMouseButtons} from 'utils/pointer/mouseButtons'
import {FakeEventInit, FakeMouseEvent, FakePointerEvent, wait} from '../utils'
import {getNextKeyDef} from './getNextKeyDef'
import {Coords, pointerKey, pointerOptions, pointerState} from './types'

export async function pointerImplementation(
  keys: string,
  target: Element,
  partialCoords: Partial<Coords>,
  options: pointerOptions,
  state: pointerState,
): Promise<void> {
  const coords = completeCoords(partialCoords)
  const {keyDef, consumedLength, releasePrevious, releaseSelf} = getNextKeyDef(
    keys,
    options,
  )

  const previous = keyDef && state.pressed.find(p => p.keyDef === keyDef)
  if (previous) {
    up(keyDef, target, coords, state, previous)
  }

  if (keyDef && !releasePrevious) {
    const press = down(keyDef, target, coords, state)

    if (releaseSelf) {
      up(keyDef, target, coords, state, press)
    }
  }

  if (keys.length > consumedLength) {
    if (options.delay > 0) {
      await wait(options.delay)
    }

    return pointerImplementation(
      keys.slice(consumedLength),
      target,
      partialCoords,
      options,
      state,
    )
  }

  delete state.activeClickCount

  return void undefined
}

function completeCoords({
  x = 0,
  y = 0,
  clientX = x,
  clientY = y,
  offsetX = x,
  offsetY = y,
  pageX = clientX,
  pageY = clientY,
}: Partial<Coords>) {
  return {x, y, clientX, clientY, offsetX, offsetY, pageX, pageY}
}

function getNextPointerId(state: pointerState) {
  state.pointerId = state.pointerId + 1
  return state.pointerId
}

function down(
  keyDef: pointerKey,
  target: Element,
  coords: Coords,
  state: pointerState,
) {
  const pointerId = keyDef.type === 'mouse' ? 1 : getNextPointerId(state)

  let isMultiTouch = false
  let isPrimary = true
  if (keyDef.type !== 'mouse') {
    for (const obj of state.pressed) {
      if (obj.keyDef.type === keyDef.type) {
        obj.isMultiTouch = true
        isMultiTouch = true
        isPrimary = false
      }
    }
  }

  if (state.activeClickCount?.[0] !== keyDef.name) {
    delete state.activeClickCount
  }
  const clickCount = Number(state.activeClickCount?.[1] ?? 0) + 1
  state.activeClickCount = [keyDef.name, clickCount]

  const pressObj = {
    keyDef,
    downTarget: target,
    pointerId,
    unpreventedDefault: true,
    isMultiTouch,
    isPrimary,
    clickCount,
  }
  state.pressed.push(pressObj)

  if (
    keyDef.type !== 'mouse' ||
    !state.pressed.some(
      p => p.keyDef !== keyDef && p.keyDef.type === keyDef.type,
    )
  ) {
    firePointerEvent(
      target,
      'pointerdown',
      {keyDef, coords, pointerId, isPrimary, clickCount},
      state,
    )
  }
  if (keyDef.type === 'mouse') {
    pressObj.unpreventedDefault = firePointerEvent(
      target,
      'mousedown',
      {keyDef, coords, pointerId, isPrimary, clickCount},
      state,
    )
  }

  // TODO: touch...

  return pressObj
}

function up(
  keyDef: pointerKey,
  target: Element,
  coords: Coords,
  state: pointerState,
  pressed: pointerState['pressed'][number],
) {
  state.pressed = state.pressed.filter(p => p !== pressed)

  const {isMultiTouch, isPrimary, pointerId, clickCount} = pressed
  let {unpreventedDefault} = pressed

  if (
    keyDef.type !== 'mouse' ||
    !state.pressed.filter(p => p.keyDef.type === keyDef.type).length
  ) {
    firePointerEvent(
      target,
      'pointerup',
      {keyDef, coords, pointerId, isPrimary, clickCount},
      state,
    )
  }
  if (keyDef.type !== 'mouse' && !isMultiTouch) {
    unpreventedDefault =
      firePointerEvent(
        target,
        'mousedown',
        {keyDef, coords, pointerId, isPrimary, clickCount},
        state,
      ) && unpreventedDefault
  }

  if (keyDef.type === 'mouse' || !isMultiTouch) {
    unpreventedDefault =
      firePointerEvent(
        target,
        'mouseup',
        {keyDef, coords, pointerId, isPrimary, clickCount},
        state,
      ) && unpreventedDefault

    const canClick = keyDef.type !== 'mouse' || keyDef.button === 'primary'
    if (canClick && unpreventedDefault && target === pressed.downTarget) {
      firePointerEvent(
        target,
        'click',
        {keyDef, coords, pointerId, isPrimary, clickCount},
        state,
      )
    }
  }
}

function firePointerEvent(
  target: Element,
  type: string,
  {
    keyDef,
    coords,
    pointerId,
    isPrimary,
    clickCount,
  }: {
    keyDef: pointerKey
    coords: Coords
    pointerId: number
    isPrimary: boolean
    clickCount: number
  },
  state: pointerState,
) {
  const Event =
    type === 'click' || type.startsWith('mouse')
      ? FakeMouseEvent
      : FakePointerEvent

  let init: FakeEventInit = {
    ...coords,
    button: getMouseButton(keyDef.button ?? 0),
    buttons: getMouseButtons(...state.pressed.map(p => p.keyDef.button ?? 0)),
  }
  if (Event === FakePointerEvent) {
    init = {...init, isPrimary, pointerId, pointerType: keyDef.type}
  }
  if (['mousedown', 'mouseup', 'click'].includes(type)) {
    init.detail = clickCount
  }

  return fireEvent(target, new Event(type, init))
}
