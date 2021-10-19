import {Coords, firePointerEvent} from '../utils'
import type {pointerKey, pointerState, PointerTarget} from './types'

export interface PointerPressAction extends PointerTarget {
  keyDef: pointerKey
  releasePrevious: boolean
  releaseSelf: boolean
}

export async function pointerPress(
  {keyDef, releasePrevious, releaseSelf, target, coords}: PointerPressAction,
  state: pointerState,
): Promise<void> {
  const previous = state.pressed.find(p => p.keyDef === keyDef)

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
  state: pointerState,
) {
  const {name, pointerType, button} = keyDef
  const pointerId = pointerType === 'mouse' ? 1 : getNextPointerId(state)

  state.position[pointerName] = {
    pointerId,
    pointerType,
    target,
    coords,
  }

  let isMultiTouch = false
  let isPrimary = true
  if (pointerType !== 'mouse') {
    for (const obj of state.pressed) {
      if (obj.keyDef.pointerType === pointerType) {
        obj.isMultiTouch = true
        isMultiTouch = true
        isPrimary = false
      }
    }
  }

  if (state.activeClickCount?.[0] !== name) {
    delete state.activeClickCount
  }
  const clickCount = Number(state.activeClickCount?.[1] ?? 0) + 1
  state.activeClickCount = [name, clickCount]

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
    pointerType !== 'mouse' ||
    !state.pressed.some(
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
      button,
      buttons: state.pressed
        .filter(p => p.keyDef.pointerType === pointerType)
        .map(p => p.keyDef.button ?? 0),
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
  state: pointerState,
  pressed: pointerState['pressed'][number],
) {
  state.pressed = state.pressed.filter(p => p !== pressed)

  const {isMultiTouch, isPrimary, pointerId, clickCount} = pressed
  let {unpreventedDefault} = pressed

  state.position[pointerName] = {
    pointerId,
    pointerType,
    target,
    coords,
  }

  // TODO: pointerleave for touch device

  if (
    pointerType !== 'mouse' ||
    !state.pressed.filter(p => p.keyDef.pointerType === pointerType).length
  ) {
    fire('pointerup')
  }
  if (pointerType !== 'mouse' && !isMultiTouch) {
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
      button,
      buttons: state.pressed
        .filter(p => p.keyDef.pointerType === pointerType)
        .map(p => p.keyDef.button ?? 0),
      clickCount,
      coords,
      isPrimary,
      pointerId,
      pointerType,
    })
  }
}
