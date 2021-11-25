import type {UserEvent} from '../setup'

export async function tab(
  this: UserEvent,
  {
    shift,
  }: {
    shift?: boolean
  } = {},
) {
  return this.keyboard(
    shift === true
      ? '{Shift>}{Tab}{/Shift}'
      : shift === false
      ? '[/ShiftLeft][/ShiftRight]{Tab}'
      : '{Tab}',
  )
}
