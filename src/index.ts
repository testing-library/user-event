import {specialCharMap} from './keyboard'
import {userEventApis, UserEventApis, setup} from './setup'

const userEvent: UserEventApis & {
  setup: typeof setup
} = {
  ...userEventApis,
  setup,
}

export default userEvent

export {specialCharMap as specialChars}
export type {keyboardKey} from './keyboard'
