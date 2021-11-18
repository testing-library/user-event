import type {UserEvent} from '../setup'

export interface tabOptions {
  shift?: boolean
}

export async function tab(this: UserEvent, {shift}: tabOptions = {}) {
  return this.keyboard(
    shift === true
      ? '{Shift>}{Tab}{/Shift}'
      : shift === false
      ? '[/ShiftLeft][/ShiftRight]{Tab}'
      : '{Tab}',
  )
}
