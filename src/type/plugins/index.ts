import { handleSelectall } from "type/specialCharCallbackMap/handleSelectall"
import { behaviorPlugin } from "../types"
import * as arrowKeys from './arrow'
import * as controlKeys from './control'
import * as characterKeys from './character'
import * as functionalKeys from './functional'

export const replaceKeydownBehavior: behaviorPlugin[] = [
    {
        matches: (keyDef) => keyDef.key === 'selectall',
        handle: (keyDef, element) => {
            handleSelectall({currentElement: () => element})
            return false
        }
    }
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

export const keyupBehavior: behaviorPlugin[] = [
]

export const postKeyupBehavior: behaviorPlugin[] = [
    ...functionalKeys.postKeyupBehavior,
]
