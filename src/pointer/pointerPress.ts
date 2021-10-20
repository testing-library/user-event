import {Coords, firePointerEvent} from '../utils'
import type {
  inputDeviceState,
  pointerKey,
  pointerState,
  PointerTarget,
} from './types'

export interface PointerPressAction extends PointerTarget {
  keyDef: pointerKey
  releasePrevious: boolean
  releaseSelf: boolean
}

export async function pointerPress(
  {keyDef, releasePrevious, releaseSelf, target, coords}: PointerPressAction,
  state: inputDeviceState,
): Promise<void> {
  const previous = state.pointerState.pressed.find(p => p.keyDef === keyDef)

  const pointerName =
    keyDef.pointerType === 'touch' ? keyDef.name : keyDef.pointerType

  if (previous) {
    up(pointerName, keyDef, target, coords, state, previous)
  }

  if (!releasePrevious) {
    const press = down(pointerName, keyDef, target, coords, state)

    if (releaseSelf) {
      up(pointerName, keyDef, target, coords, state, press)
    }
  }
}

function getNextPointerId(state: pointerState) {
  state.pointerId = state.pointerId + 1
  return state.pointerId
}

function down(
  pointerName: string,
  keyDef: pointerKey,
  target: Element,
  coords: Coords,
  {pointerState, keyboardState}: inputDeviceState,
) {
  const {name, pointerType, button} = keyDef
  const pointerId = pointerType === 'mouse' ? 1 : getNextPointerId(pointerState)

  pointerState.position[pointerName] = {
    pointerId,
    pointerType,
    target,
    coords,
  }

  let isMultiTouch = false
  let isPrimary = true
  if (pointerType !== 'mouse') {
    for (const obj of pointerState.pressed) {
      // TODO: test multi device input across browsers
      // istanbul ignore else
      if (obj.keyDef.pointerType === pointerType) {
        obj.isMultiTouch = true
        isMultiTouch = true
        isPrimary = false
      }
    }
  }

  if (pointerState.activeClickCount?.[0] !== name) {
    delete pointerState.activeClickCount
  }
  const clickCount = Number(pointerState.activeClickCount?.[1] ?? 0) + 1
  pointerState.activeClickCount = [name, clickCount]

  const pressObj = {
    keyDef,
    downTarget: target,
    pointerId,
    unpreventedDefault: true,
    isMultiTouch,
    isPrimary,
    clickCount,
  }
  pointerState.pressed.push(pressObj)

  if (pointerType !== 'mouse') {
    fire('pointerover')
    fire('pointerenter')
  }
  if (
    pointerType !== 'mouse' ||
    !pointerState.pressed.some(
      p => p.keyDef !== keyDef && p.keyDef.pointerType === pointerType,
    )
  ) {
    fire('pointerdown')
  }
  if (pointerType === 'mouse') {
    pressObj.unpreventedDefault = fire('mousedown')
  }

  // TODO: touch...

  return pressObj

  function fire(type: string) {
    return firePointerEvent(target, type, {
      pointerState,
      keyboardState,
      button,
      clickCount,
      coords,
      isPrimary,
      pointerId,
      pointerType,
    })
  }
}

function up(
  pointerName: string,
  {pointerType, button}: pointerKey,
  target: Element,
  coords: Coords,
  {pointerState, keyboardState}: inputDeviceState,
  pressed: pointerState['pressed'][number],
) {
  pointerState.pressed = pointerState.pressed.filter(p => p !== pressed)

  const {isMultiTouch, isPrimary, pointerId, clickCount} = pressed
  let {unpreventedDefault} = pressed

  pointerState.position[pointerName] = {
    pointerId,
    pointerType,
    target,
    coords,
  }

  // TODO: pointerleave for touch device

  if (
    pointerType !== 'mouse' ||
    !pointerState.pressed.filter(p => p.keyDef.pointerType === pointerType)
      .length
  ) {
    fire('pointerup')
  }
  if (pointerType !== 'mouse') {
    fire('pointerout')
    fire('pointerleave')
  }
  if (pointerType !== 'mouse' && !isMultiTouch) {
    if (clickCount === 1) {
      fire('mouseover')
      fire('mouseenter')
    }
    fire('mousemove')
    unpreventedDefault = fire('mousedown') && unpreventedDefault
  }

  if (pointerType === 'mouse' || !isMultiTouch) {
    unpreventedDefault = fire('mouseup') && unpreventedDefault

    const canClick = pointerType !== 'mouse' || button === 'primary'
    if (canClick && unpreventedDefault && target === pressed.downTarget) {
      fire('click')
    }
  }

  function fire(type: string) {
    return firePointerEvent(target, type, {
      pointerState,
      keyboardState,
      button,
      clickCount,
      coords,
      isPrimary,
      pointerId,
      pointerType,
    })
  }
}
