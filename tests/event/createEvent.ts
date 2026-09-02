import {createEvent} from '#src/event/createEvent'
import {render} from '#testHelpers'

test('it initializes pointerType to empty string by default', () => {
  const {element} = render(`<input type="checkbox"/>`)
  const event = createEvent('click', element)
  expect(event).toHaveProperty('pointerType', '')
})

test('it preserves explicitly provided pointerType', () => {
  const {element} = render(`<input type="checkbox"/>`)
  const event = createEvent('pointerdown', element, {pointerType: 'mouse'})
  expect(event).toHaveProperty('pointerType', 'mouse')
})
