import {PointerEventsCheckLevel} from '../../options'
import {Config} from '../../setup'
import {ApiLevel, getLevelRef} from '..'
import {getWindow} from '../misc/getWindow'

export function hasPointerEvents(element: Element): boolean {
  const window = getWindow(element)

  for (
    let el: Element | null = element;
    el?.ownerDocument;
    el = el.parentElement
  ) {
    const pointerEvents = window.getComputedStyle(el).pointerEvents
    if (pointerEvents && !['inherit', 'unset'].includes(pointerEvents)) {
      return pointerEvents !== 'none'
    }
  }

  return true
}

const PointerEventsCheck = Symbol('Last check for pointer-events')
declare global {
  interface Element {
    [PointerEventsCheck]?: {
      [k in ApiLevel]?: object
    } & {
      result: boolean
    }
  }
}

export function assertPointerEvents(config: Config, element: Element) {
  const lastCheck = element[PointerEventsCheck]

  const needsCheck =
    config.pointerEventsCheck !== PointerEventsCheckLevel.Never &&
    (!lastCheck ||
      (hasBitFlag(
        config.pointerEventsCheck,
        PointerEventsCheckLevel.EachApiCall,
      ) &&
        lastCheck[ApiLevel.Call] !== getLevelRef(config, ApiLevel.Call)) ||
      (hasBitFlag(
        config.pointerEventsCheck,
        PointerEventsCheckLevel.EachTrigger,
      ) &&
        lastCheck[ApiLevel.Trigger] !== getLevelRef(config, ApiLevel.Trigger)))

  if (!needsCheck) {
    return
  }

  const result = hasPointerEvents(element)

  element[PointerEventsCheck] = {
    [ApiLevel.Call]: getLevelRef(config, ApiLevel.Call),
    [ApiLevel.Trigger]: getLevelRef(config, ApiLevel.Trigger),
    result,
  }

  if (!result) {
    throw new Error(
      'Unable to perform pointer interaction as the element has or inherits pointer-events set to "none".',
    )
  }
}

// With the eslint rule and prettier the bitwise operation isn't nice to read
function hasBitFlag(conf: number, flag: number) {
  // eslint-disable-next-line no-bitwise
  return (conf & flag) > 0
}
