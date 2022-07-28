/* eslint-disable @typescript-eslint/no-use-before-define */

import {setUISelection} from '../../document'
import {
  focus,
  getTabDestination,
  getValue,
  hasOwnSelection,
  input,
  isContentEditable,
  isEditable,
  isElementType,
  moveSelection,
  selectAll,
  setSelectionRange,
  walkRadio,
} from '../../utils'
import {BehaviorPlugin} from '.'
import {behavior} from './registry'

behavior.keydown = (event, target, config) => {
  return (
    keydownBehavior[event.key]?.(event, target, config) ??
    combinationBehavior(event, target, config)
  )
}

const keydownBehavior: {
  [key: string]: BehaviorPlugin<'keydown'> | undefined
} = {
  ArrowDown: (event, target, config) => {
    /* istanbul ignore else */
    if (isElementType(target, 'input', {type: 'radio'} as const)) {
      return () => walkRadio(config, target, -1)
    }
  },
  ArrowLeft: (event, target, config) => {
    if (isElementType(target, 'input', {type: 'radio'} as const)) {
      return () => walkRadio(config, target, -1)
    }
    return () => moveSelection(target, -1)
  },
  ArrowRight: (event, target, config) => {
    if (isElementType(target, 'input', {type: 'radio'} as const)) {
      return () => walkRadio(config, target, 1)
    }
    return () => moveSelection(target, 1)
  },
  ArrowUp: (event, target, config) => {
    /* istanbul ignore else */
    if (isElementType(target, 'input', {type: 'radio'} as const)) {
      return () => walkRadio(config, target, 1)
    }
  },
  Backspace: (event, target, config) => {
    if (isEditable(target)) {
      return () => {
        input(config, target, '', 'deleteContentBackward')
      }
    }
  },
  Delete: (event, target, config) => {
    if (isEditable(target)) {
      return () => {
        input(config, target, '', 'deleteContentForward')
      }
    }
  },
  End: (event, target) => {
    if (
      isElementType(target, ['input', 'textarea']) ||
      isContentEditable(target)
    ) {
      return () => {
        const newPos = getValue(target)?.length ?? /* istanbul ignore next */ 0
        setSelectionRange(target, newPos, newPos)
      }
    }
  },
  Home: (event, target) => {
    if (
      isElementType(target, ['input', 'textarea']) ||
      isContentEditable(target)
    ) {
      return () => {
        setSelectionRange(target, 0, 0)
      }
    }
  },
  PageDown: (event, target) => {
    if (isElementType(target, ['input'])) {
      return () => {
        const newPos = getValue(target).length
        setSelectionRange(target, newPos, newPos)
      }
    }
  },
  PageUp: (event, target) => {
    if (isElementType(target, ['input'])) {
      return () => {
        setSelectionRange(target, 0, 0)
      }
    }
  },
  Tab: (event, target, config) => {
    return () => {
      const dest = getTabDestination(
        target,
        config.system.keyboard.modifiers.Shift,
      )
      focus(dest)
      if (hasOwnSelection(dest)) {
        setUISelection(dest, {
          anchorOffset: 0,
          focusOffset: dest.value.length,
        })
      }
    }
  },
}

const combinationBehavior: BehaviorPlugin<'keydown'> = (
  event,
  target,
  config,
) => {
  if (event.code === 'KeyA' && config.system.keyboard.modifiers.Control) {
    return () => selectAll(target)
  }
}
