import type {Options} from '../../options'

export function wait(
  time: number,
  advanceTimers: Exclude<Options['advanceTimers'], undefined>,
) {
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), time)
    advanceTimers(time)
  })
}
