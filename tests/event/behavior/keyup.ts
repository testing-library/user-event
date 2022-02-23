import {setup} from '#testHelpers'

describe('release [Space]', () => {
  test.each([
    [`<input type="checkbox"/>`, true],
    [`<button></button>`, true],
    [`<input/>`, false],
  ])('dispatch `click` on `%s`: %s', async (html, click) => {
    const {clearEventCalls, eventWasFired, user} = setup(html)
    await user.keyboard('[Space>]')
    clearEventCalls()

    await user.keyboard('[/Space]')

    expect(eventWasFired('click')).toBe(click)
  })
})
