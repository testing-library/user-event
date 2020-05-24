import '@testing-library/jest-dom/extend-expect'
import diff from 'jest-diff'

// prevent console calls from making it out into the wild
beforeEach(() => {
  jest.spyOn(console, 'error')
  jest.spyOn(console, 'log')
  jest.spyOn(console, 'warn')
  jest.spyOn(console, 'info')
})

afterEach(() => {
  if (console.error.mock.calls.length) {
    throw new Error(`console.error should not be called in tests`)
  }
  console.error.mockRestore()

  if (console.log.mock.calls.length) {
    throw new Error(`console.log should not be called in tests`)
  }
  console.log.mockRestore()

  if (console.warn.mock.calls.length) {
    throw new Error(`console.warn should not be called in tests`)
  }
  console.warn.mockRestore()

  if (console.info.mock.calls.length) {
    throw new Error(`console.info should not be called in tests`)
  }
  console.info.mockRestore()
})

const pick = (obj, keys) =>
  keys.reduce((acc, key) => ({...acc, [key]: obj[key]}), {})

expect.extend({
  toHaveBeenCalledWithEventAtIndex(received, callIndex, matchEvent) {
    const event = received.mock.calls[callIndex][0]
    const keys = Object.keys(matchEvent)

    for (const key of keys) {
      if (event[key] !== matchEvent[key]) {
        const diffString = diff(matchEvent, pick(event, keys), {
          expand: this.expand,
        })

        return {
          actual: received,
          message: () =>
            `Expected event at call index ${callIndex} to be called with matching event properties.\n\n` +
            `Difference:\n\n${diffString}`,
          pass: false,
        }
      }
    }

    return {
      actual: received,
      message: () =>
        `Expected event at call index ${callIndex} not to have any matching properties\n\n` +
        `Expected: not ${this.utils.printExpected(matchEvent)}\n` +
        `Received: ${this.utils.printReceived(pick(event, keys))}`,
      pass: true,
    }
  },
})

/*
eslint
  no-console: "off",
*/
