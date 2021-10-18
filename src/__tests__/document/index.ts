import {setup} from '../helpers/utils'
import {prepareDocument} from '../../document'
import {getUIValue, setUIValue} from '../../document/value'

function prepare(element: Element) {
  prepareDocument(element.ownerDocument)
  // safe to call multiple times
  prepareDocument(element.ownerDocument)
  prepareDocument(element.ownerDocument)
}

test('keep track of value in UI', () => {
  const {element} = setup<HTMLInputElement>(`<input type="number"/>`)
  // The element has to either receive focus or be already focused when preparing.
  element.focus()

  prepare(element)

  setUIValue(element, '2e-')

  expect(element).toHaveValue(null)
  expect(getUIValue(element)).toBe('2e-')

  element.value = '3'

  expect(element).toHaveValue(3)
  expect(getUIValue(element)).toBe('3')
})

test('trigger `change` event if value changed since focus/set', () => {
  const {element, getEvents} = setup<HTMLInputElement>(`<input type="number"/>`)

  prepare(element)

  element.focus()
  // Invalid value is equal to empty
  setUIValue(element, '2e-')
  element.blur()

  expect(getEvents('change')).toHaveLength(0)

  element.focus()
  // Programmatically changing value sets initial value
  element.value = '3'
  setUIValue(element, '3')
  element.blur()

  expect(getEvents('change')).toHaveLength(0)

  element.focus()
  element.value = '2'
  setUIValue(element, '3')
  element.blur()

  expect(getEvents('change')).toHaveLength(1)
})
