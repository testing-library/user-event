import {wrapEvent} from '#src/event/wrapEvent'

declare global {
  interface Element {
    testData?: TestData
  }
}

export type TestDataProps = {
  value?: string
  checked?: boolean
  selectionStart?: number | null
  selectionEnd?: number | null
}

export type TestData = {
  handled?: boolean

  // Where is this assigned?
  before?: TestDataProps
  after?: TestDataProps
}

jest.mock('#src/event/wrapEvent', () => ({
  wrapEvent(...[cb, element]: Parameters<typeof wrapEvent>) {
    const before = getTrackedElementValues(element as TestDataProps)
    const testData = {before}

    // put it on the element so the event handler can grab it
    element.testData = testData

    const result = jest
      .requireActual<{
        wrapEvent: typeof wrapEvent
      }>('#src/event/wrapEvent')
      .wrapEvent(cb, element)

    const after = getTrackedElementValues(element as TestDataProps)
    Object.assign(testData, {after})

    // elete the testData for the next event
    delete element.testData
    return result

    function getTrackedElementValues(el: TestDataProps): TestDataProps {
      return {
        value: el.value,
        checked: el.checked,
        selectionStart: el.selectionStart,
        selectionEnd: el.selectionEnd,

        // unfortunately, changing a select option doesn't happen within fireEvent
        // but rather imperatively via `options.selected = newValue`
        // because of this we don't (currently) have a way to track before/after
        // in a given fireEvent call.
      }
    }
  },
}))
