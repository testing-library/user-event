import {behaviorPlugin} from '../types'
import {isElementType, setSelectionRange} from '../../utils'
import * as arrowKeys from './arrow'
import * as controlKeys from './control'
import * as characterKeys from './character'
import * as functionalKeys from './functional'

export const replaceBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key === 'selectall' &&
      isElementType(element, ['input', 'textarea']),
    handle: (keyDef, element, options, state) => {
      setSelectionRange(
        element,
        0,
        (
          state.carryValue ??
          (element as HTMLInputElement | HTMLTextAreaElement).value
        ).length,
      )
    },
  },
]

export const preKeydownBehavior: behaviorPlugin[] = [
  ...functionalKeys.preKeydownBehavior,
]

export const keydownBehavior: behaviorPlugin[] = [
  ...arrowKeys.keydownBehavior,
  ...controlKeys.keydownBehavior,
  ...functionalKeys.keydownBehavior,
]

export const keypressBehavior: behaviorPlugin[] = [
  ...functionalKeys.keypressBehavior,
  ...characterKeys.keypressBehavior,
]

export const preKeyupBehavior: behaviorPlugin[] = [
  ...functionalKeys.preKeyupBehavior,
]

export const keyupBehavior: behaviorPlugin[] = [...functionalKeys.keyupBehavior]

export const postKeyupBehavior: behaviorPlugin[] = [
  ...functionalKeys.postKeyupBehavior,
]
