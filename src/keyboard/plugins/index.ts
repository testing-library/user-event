import {behaviorPlugin} from '../types'
import * as arrowKeys from './arrow'
import * as controlKeys from './control'
import * as characterKeys from './character'
import * as functionalKeys from './functional'
import * as combination from './combination'
import * as modifiers from './modifiers'

export const preKeydownBehavior: behaviorPlugin[] = [
  ...modifiers.preKeydownBehavior,
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
  ...modifiers.preKeyupBehavior,
]

export const keyupBehavior: behaviorPlugin[] = [...functionalKeys.keyupBehavior]

export const postKeyupBehavior: behaviorPlugin[] = [
  ...modifiers.postKeyupBehavior,
]
