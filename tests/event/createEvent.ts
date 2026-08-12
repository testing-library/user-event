import {createEvent} from '#src/event/createEvent'
import {render} from '#testHelpers'

function setupInput() {
  return render(`<input/>`).element
}

describe('UIEvents receive the window as `view`', () => {
  test.each([
    ['keydown', 'KeyboardEvent'],
    ['keyup', 'KeyboardEvent'],
    ['mousedown', 'MouseEvent'],
    ['mouseup', 'MouseEvent'],
    ['click', 'PointerEvent'],
    ['pointerdown', 'PointerEvent'],
    ['pointerup', 'PointerEvent'],
    ['focus', 'FocusEvent'],
    ['blur', 'FocusEvent'],
    ['input', 'InputEvent'],
    ['beforeinput', 'InputEvent'],
  ] as const)('`%s` (%s) has `view === window`', type => {
    const element = setupInput()

    const event = createEvent(type, element) as UIEvent

    expect(event.view).toBe(window)
  })
})

test('non-UIEvents do not expose `view`', () => {
  const element = setupInput()

  const event = createEvent('change', element)

  expect((event as unknown as UIEvent).view).toBe(undefined)
})

test('an explicitly provided `view` is not overwritten', () => {
  const element = setupInput()
  const otherWindow = {} as Window

  const event = createEvent('click', element, {view: otherWindow})

  expect(event.view).toBe(otherWindow)
})
