import {setup} from '__tests__/helpers/utils'
import {isDescendantOrSelf} from '../../../utils'

test('isDescendantOrSelf', () => {
  setup(`<div><p><span></span><a></a></p></div>`)

  expect(
    isDescendantOrSelf(
      document.querySelector('span') as Element,
      document.querySelector('a') as Element,
    ),
  ).toBe(false)
  expect(
    isDescendantOrSelf(
      document.querySelector('span') as Element,
      document.querySelector('div') as Element,
    ),
  ).toBe(true)
  expect(
    isDescendantOrSelf(
      document.querySelector('span') as Element,
      document.querySelector('span') as Element,
    ),
  ).toBe(true)
})
