import {setup} from '#testHelpers'

test.each(['Backspace', 'Delete', 'End', 'Home', 'PageUp', 'PageDown'])(
  'implement no keydown behavior for [%s] outside of editable context',
  async code => {
    const {getEvents, user} = setup(`<div tabIndex="1"></div>`)

    await user.keyboard(`[${code}>]`)

    expect(getEvents().map(e => e.type)).toEqual(['keydown'])
  },
)
