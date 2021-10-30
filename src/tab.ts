import type {UserEvent} from './setup'

export interface tabOptions {
  shift?: boolean
}

export function tab(this: UserEvent, {shift}: tabOptions = {}) {
  this.keyboard(
    shift === true
      ? '{Shift>}{Tab}{/Shift}'
      : shift === false
      ? '[/ShiftLeft][/ShiftRight]{Tab}'
      : '{Tab}',
  )
}
