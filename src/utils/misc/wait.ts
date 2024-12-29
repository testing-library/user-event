import {type Instance} from '../../setup'

export async function wait(config: Instance['config']): Promise<void> {
  const delay = config.delay
  if (typeof delay !== 'number') {
    return
  }
  await Promise.all([
    new Promise<void>(resolve => globalThis.setTimeout(() => resolve(), delay)),
    config.advanceTimers(delay),
  ])
}
