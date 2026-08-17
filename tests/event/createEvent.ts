import {createEvent} from '#src/event/createEvent'
import {render} from '#testHelpers'

test('it does not stringify click pointerType', () => {
  const {element} = render(`<input type="checkbox"/>`)
  const event = createEvent('click', element)
  expect(event).toHaveProperty('pointerType', undefined)
})
