import '../../_helpers/shadow-input'
import {setup} from '#testHelpers'
import {getActiveElement, getActiveElementOrBody} from '#src/utils'

describe('focus tests with not shadow root', () => {
  test('focus input element', async () => {
    const {element} = setup('<input />')

    expect(getActiveElementOrBody(document)).toBe(element)
  })

  test('focus should be body', async () => {
    setup('<input />', {focus: false})

    expect(getActiveElementOrBody(document)).toBe(document.body)
  })
})

describe('on shadow DOM', () => {
  test('focus contained input element', async () => {
    const {element} = setup('<shadow-input></shadow-input>')

    expect(getActiveElement(document)).toBe(
      element.shadowRoot?.querySelector('input'),
    )
  })
  test('focus just body', async () => {
    setup('<shadow-input></shadow-input>', {focus: false})

    expect(getActiveElementOrBody(document)).toBe(document.body)
  })
})
