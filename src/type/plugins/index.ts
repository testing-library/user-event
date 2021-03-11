import { handleSelectall } from "type/specialCharCallbackMap/handleSelectall"
import { behaviorPlugin } from "../types"
import * as functionalKeys from './functional'
import * as characterKeys from './character'

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
    ...characterKeys.keydownBehavior,
]

export const preKeyupBehavior: behaviorPlugin[] = [
    ...functionalKeys.preKeyupBehavior,
]

export const postKeyupBehavior: behaviorPlugin[] = [
    ...functionalKeys.postKeyupBehavior,
]
