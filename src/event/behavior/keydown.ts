/* eslint-disable @typescript-eslint/no-use-before-define */

import {getUIValue, setUISelection, getValueOrTextContent} from '../../document'
import {
  getTabDestination,
  hasOwnSelection,
  isContentEditable,
  isEditable,
  isElementType,
} from '../../utils'
import {focusElement} from '../focus'
import {input} from '../input'
import {moveSelection, selectAll, setSelectionRange} from '../selection'
import {walkRadio} from '../radio'
import {BehaviorPlugin} from '.'
import {behavior} from './registry'

behavior.keydown = (event, target, instance) => {
  return (
    keydownBehavior[event.key]?.(event, target, instance) ??
    combinationBehavior(event, target, instance)
  )
}

const keydownBehavior: {
  [key: string]: BehaviorPlugin<'keydown'> | undefined
} = {
  ArrowDown: (event, target, instance) => {
    /* istanbul ignore else */
    if (isElementType(target, 'input', {type: 'radio'} as const)) {
      return () => walkRadio(instance, target, -1)
    }
  },
  ArrowLeft: (event, target, instance) => {
    if (isElementType(target, 'input', {type: 'radio'} as const)) {
      return () => walkRadio(instance, target, -1)
    }
    return () => moveSelection(target, -1)
  },
  ArrowRight: (event, target, instance) => {
    if (isElementType(target, 'input', {type: 'radio'} as const)) {
      return () => walkRadio(instance, target, 1)
    }
    return () => moveSelection(target, 1)
  },
  ArrowUp: (event, target, instance) => {
    /* istanbul ignore else */
    if (isElementType(target, 'input', {type: 'radio'} as const)) {
      return () => walkRadio(instance, target, 1)
    }
  },
  Backspace: (event, target, instance) => {
    if (isEditable(target)) {
      return () => {
        input(instance, target, '', 'deleteContentBackward')
      }
    }
  },
  Delete: (event, target, instance) => {
    if (isEditable(target)) {
      return () => {
        input(instance, target, '', 'deleteContentForward')
      }
    }
  },
  End: (event, target) => {
    if (
      isElementType(target, ['input', 'textarea']) ||
      isContentEditable(target)
    ) {
      return () => {
        const newPos =
          getValueOrTextContent(target)?.length ?? /* istanbul ignore next */ 0
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
        const newPos = getUIValue(target).length
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
  Tab: (event, target, instance) => {
    return () => {
      const dest = getTabDestination(
        target,
        instance.system.keyboard.modifiers.Shift,
      )
      focusElement(dest)
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
  instance,
) => {
  if (event.code === 'KeyA' && instance.system.keyboard.modifiers.Control) {
    return () => selectAll(target)
  }
}
