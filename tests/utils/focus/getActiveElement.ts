import {
  defineShadowInputCustomElementIfNotDefined,
  ShadowInput,
} from '../../_helpers/shadow-input'
import {setup} from '#testHelpers'
import {getActiveElementOrBody} from '#src/utils'

test('focused input element', async () => {
  const {element} = setup('<input />')

  expect(getActiveElementOrBody(document)).toBe(element)
})

test('focus should be body', async () => {
  const {element} = setup<HTMLInputElement>('<input />', {focus: false})
  element.blur()
  expect(getActiveElementOrBody(document)).toBe(document.body)
})

describe('on shadow DOM', () => {
  test('get focused element inside shadow tree', async () => {
    defineShadowInputCustomElementIfNotDefined()
    const {element} = setup('<shadow-input></shadow-input>')

    expect(getActiveElementOrBody(document)).toBe(
      element.shadowRoot?.querySelector('input'),
    )
  })
  test('focus just body', async () => {
    defineShadowInputCustomElementIfNotDefined()
    const {element} = setup<ShadowInput>('<shadow-input></shadow-input>', {
      focus: false,
    })
    element.blur()
    expect(getActiveElementOrBody(document)).toBe(document.body)
  })
})
