import {specialCharMap} from './keyboard'
import {userEventApis, UserEventApis, setup, UserEvent} from './setup'

const userEvent: UserEventApis & {
  setup: typeof setup
} = {
  ...(Object.fromEntries(
    Object.entries(userEventApis).map(([k, f]) => [
      k,
      (...a: unknown[]) =>
        (f as (this: UserEvent, ...b: unknown[]) => unknown).apply(
          userEvent,
          a,
        ),
    ]),
  ) as UserEventApis),
  setup,
}

export default userEvent

export {specialCharMap as specialChars}
export type {keyboardKey} from './keyboard'
