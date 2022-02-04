import {dispatchUIEvent} from '#src/event'
import {behavior, BehaviorPlugin} from '#src/event/behavior'
import {createConfig} from '#src/setup/setup'
import {setup} from '#testHelpers/utils'

jest.mock('#src/event/behavior', () => ({
  behavior: {
    click: jest.fn(),
  },
}))

const mockPlugin = behavior.click as jest.MockedFunction<
  BehaviorPlugin<'click'>
>

afterEach(() => {
  jest.clearAllMocks()
})

test('keep default behavior', () => {
  const {element} = setup(`<input type="checkbox"/>`)

  dispatchUIEvent(createConfig(), element, 'click')

  expect(mockPlugin).toBeCalledTimes(1)
  expect(element).toBeChecked()
})

test('replace default behavior', () => {
  const {element} = setup(`<input type="checkbox"/>`)

  const mockBehavior = jest.fn()
  mockPlugin.mockImplementationOnce(() => mockBehavior)

  dispatchUIEvent(createConfig(), element, 'click')

  expect(mockPlugin).toBeCalledTimes(1)
  expect(element).not.toBeChecked()
  expect(mockBehavior).toBeCalled()
})

test('prevent replaced default behavior', () => {
  const {element} = setup(`<input type="checkbox"/>`)
  element.addEventListener('click', e => {
    expect(e).toHaveProperty('defaultPrevented', false)
    e.preventDefault()
    expect(e).toHaveProperty('defaultPrevented', true)
  })

  const mockBehavior = jest.fn()
  mockPlugin.mockImplementationOnce(() => mockBehavior)

  dispatchUIEvent(createConfig(), element, 'click')

  expect(mockPlugin).toBeCalledTimes(1)
  expect(element).not.toBeChecked()
  expect(mockBehavior).not.toBeCalled()
})
