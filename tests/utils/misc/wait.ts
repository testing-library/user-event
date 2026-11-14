import {createConfig} from '#src/setup/setup'
import {wait} from '#src/utils/misc/wait'

test('advances timers when set', async () => {
  const beforeReal = performance.now()
  timers.useFakeTimers()
  const beforeFake = performance.now()

  const config = createConfig({
    delay: 1000,
    advanceTimers: t => timers.advanceTimersByTime(t),
  })
  await wait(config)

  expect(performance.now() - beforeFake).toBe(1000)
  timers.useRealTimers()
  expect(performance.now() - beforeReal).toBeLessThan(1000)
}, 10)
