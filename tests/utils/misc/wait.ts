import {createConfig} from '#src/setup/setup'
import {wait} from '#src/utils/misc/wait'

test('advances timers when set', async () => {
  const beforeReal = performance.now()
  jest.useFakeTimers()
  const beforeFake = performance.now()

  const config = createConfig({
    delay: 1000,
    advanceTimers: jest.advanceTimersByTime,
  })
  await wait(config)

  expect(performance.now() - beforeFake).toBe(1000)
  jest.useRealTimers()
  expect(performance.now() - beforeReal).toBeLessThan(1000)
}, 10)
