import {setup} from '#testHelpers'
import {getActiveElementOrBody} from '#src/utils'

test('focused input element', async () => {
  const {element} = setup('<input />')

  expect(getActiveElementOrBody(document)).toBe(element)
})

test('default to body as active element', async () => {
  const {element} = setup<HTMLInputElement>('<input />', {focus: false})
  element.blur()
  expect(getActiveElementOrBody(document)).toBe(document.body)
})

describe('on shadow DOM', () => {
  test('get focused element inside shadow tree', async () => {
    const {element} = setup('<shadow-input></shadow-input>')

    expect(getActiveElementOrBody(document)).toBe(
      element.shadowRoot?.querySelector('input'),
    )
  })
})
