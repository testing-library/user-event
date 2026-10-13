import {advanceFakeTimers} from '#src/utils'

test('advance fake timers installed on the global scope', () => {
  timers.useFakeTimers()
  try {
    let fired = false
    globalThis.setTimeout(() => {
      fired = true
    }, 100)

    advanceFakeTimers(100)

    expect(fired).toBe(true)
  } finally {
    timers.useRealTimers()
  }
})

test('do nothing when fake timers are not installed', () => {
  expect(globalThis.setTimeout).not.toHaveProperty('clock')

  expect(() => advanceFakeTimers(100)).not.toThrow()
})

test('do nothing when the global timers are not faked', () => {
  timers.useFakeTimers({toFake: ['Date']})
  try {
    const before = Date.now()

    expect(() => advanceFakeTimers(100)).not.toThrow()

    expect(Date.now()).toBe(before)
  } finally {
    timers.useRealTimers()
  }
})
