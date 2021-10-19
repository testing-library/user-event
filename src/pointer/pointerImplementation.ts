import {Coords, wait} from '../utils'
import {getNextKeyDef} from './getNextKeyDef'
import {pointerKeyImplementation} from './pointerKeyImplementation'
import {pointerOptions, pointerState} from './types'

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

  if (keyDef) {
    const promise = pointerKeyImplementation(
      {
        keyDef,
        releasePrevious,
        coords,
        releaseSelf,
        target,
      },
      state,
    )
    if (options.delay > 0) {
      await promise
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
