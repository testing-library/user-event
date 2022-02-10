import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test.each(['Backspace', 'Delete', 'End', 'Home', 'PageUp', 'PageDown'])(
  'implement no keydown behavior for [%s] outside of editable context',
  async code => {
    const {element, getEvents, clearEventCalls} = setup(
      `<div tabIndex="1"></div>`,
    )
    element.focus()
    clearEventCalls()

    await userEvent.keyboard(`[${code}>]`)

    expect(getEvents().map(e => e.type)).toEqual(['keydown'])
  },
)
