import {wait} from '#src/utils/misc/wait'

test('advances timers when set', async () => {
  jest.useFakeTimers()
  jest.setTimeout(50)
  // If this wasn't advancing fake timers, we'd timeout and fail the test
  await wait(10000, jest.advanceTimersByTime)
  jest.useRealTimers()
})
