import {behaviorPlugin} from '../types'
import {isInstanceOfElement} from '../../utils'
import * as arrowKeys from './arrow'
import * as controlKeys from './control'
import * as characterKeys from './character'
import * as functionalKeys from './functional'

export const replaceBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key === 'selectall' &&
      (isInstanceOfElement(element, 'HTMLInputElement') ||
        isInstanceOfElement(element, 'HTMLTextAreaElement')),
    handle: (keyDef, element) => {
      ;(element as HTMLInputElement).select()
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
