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

test('advances fake timers without being configured', async () => {
  const beforeReal = performance.now()
  timers.useFakeTimers()
  try {
    const beforeFake = performance.now()

    const config = createConfig({delay: 500})
    await wait(config)

    expect(performance.now() - beforeFake).toBe(500)
  } finally {
    timers.useRealTimers()
  }
  expect(performance.now() - beforeReal).toBeLessThan(1000)
}, 10)

test('does not interfere with real timers', async () => {
  expect(globalThis.setTimeout).not.toHaveProperty('clock')

  const config = createConfig({delay: 1})
  await wait(config)
})

test('configured function takes precedence over fake timer detection', async () => {
  timers.useFakeTimers()
  try {
    const calls: number[] = []
    const config = createConfig({
      delay: 100,
      advanceTimers: t => {
        calls.push(t)
        timers.advanceTimersByTime(t)
      },
    })
    await wait(config)

    expect(calls).toEqual([100])
  } finally {
    timers.useRealTimers()
  }
}, 10)
