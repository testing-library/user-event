import userEvent from '#src'
import {setup} from '#testHelpers/utils'

describe('release [Space]', () => {
  test.each([
    [`<input type="checkbox"/>`, true],
    [`<button></button>`, true],
    [`<input/>`, false],
  ])('dispatch `click` on `%s`: %s', async (html, click) => {
    const {element, clearEventCalls, eventWasFired} = setup(html)
    element.focus()
    const user = userEvent.setup()
    await user.keyboard('[Space>]')
    clearEventCalls()

    await user.keyboard('[/Space]')

    expect(eventWasFired('click')).toBe(click)
  })
})
