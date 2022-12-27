import {behavior} from '#src/event/behavior'
import {createConfig, createInstance} from '#src/setup/setup'
import {render} from '#testHelpers'

const mockPlugin = mocks.spyOn(behavior as Required<typeof behavior>, 'click').mockImplementation(() => void 0)

afterEach(() => {
  mockPlugin.mockClear()
})

function setupInstance() {
  return createInstance(createConfig()).instance
}

test('keep default behavior', () => {
  const {element} = render(`<input type="checkbox"/>`)

  setupInstance().dispatchUIEvent(element, 'click')

  expect(mockPlugin).toBeCalledTimes(1)
  expect(element).toBeChecked()
})

test('replace default behavior', () => {
  const {element} = render(`<input type="checkbox"/>`)

  const mockBehavior = mocks.fn(() => void 0)
  mockPlugin.mockImplementationOnce(() => mockBehavior)

  setupInstance().dispatchUIEvent(element, 'click')

  expect(mockPlugin).toBeCalledTimes(1)
  expect(element).not.toBeChecked()
  expect(mockBehavior).toBeCalled()
})

test('prevent replaced default behavior', () => {
  const {element} = render(`<input type="checkbox"/>`)
  element.addEventListener('click', e => {
    expect(e).toHaveProperty('defaultPrevented', false)
    e.preventDefault()
    expect(e).toHaveProperty('defaultPrevented', true)
  })

  const mockBehavior = mocks.fn(() => void 0)
  mockPlugin.mockImplementationOnce(() => mockBehavior)

  setupInstance().dispatchUIEvent(element, 'click')

  expect(mockPlugin).toBeCalledTimes(1)
  expect(element).not.toBeChecked()
  expect(mockBehavior).not.toBeCalled()
})
