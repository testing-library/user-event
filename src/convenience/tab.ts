import type {Instance} from '../setup'

export async function tab(
  this: Instance,
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
