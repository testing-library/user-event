import {Config} from '../../setup'

export function wait(config: Config) {
  const delay = config.delay
  if (typeof delay !== 'number') {
    return
  }
  return new Promise<void>(resolve => {
    setTimeout(() => resolve(), delay)
    config.advanceTimers(delay)
  })
}
