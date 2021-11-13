import {behaviorPlugin} from '../types'
import * as arrowKeys from './arrow'
import * as controlKeys from './control'
import * as characterKeys from './character'
import * as functionalKeys from './functional'
import * as combination from './combination'

export const preKeydownBehavior: behaviorPlugin[] = [
  ...functionalKeys.preKeydownBehavior,
]

export const keydownBehavior: behaviorPlugin[] = [
  ...arrowKeys.keydownBehavior,
  ...controlKeys.keydownBehavior,
  ...functionalKeys.keydownBehavior,
  ...combination.keydownBehavior,
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
