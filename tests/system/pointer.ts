import {createConfig} from '#src/setup/setup'
import {render} from '#testHelpers'

test('ensure sanity on multiple down/up calls', async () => {
  const {element, getEvents} = render(`<button></button>`)
  const config = createConfig()

  await config.system.pointer.press(
    config,
    {name: 'a', pointerType: 'mouse'},
    {target: element},
  )
  await config.system.pointer.press(
    config,
    {name: 'b', pointerType: 'mouse'},
    {target: element},
  )
  await config.system.pointer.press(
    config,
    {name: 'b', pointerType: 'mouse'},
    {target: element},
  )
  expect(getEvents('pointerdown')).toHaveLength(1)
  expect(getEvents('mousedown')).toHaveLength(1)

  await config.system.pointer.release(
    config,
    {name: 'a', pointerType: 'mouse'},
    {target: element},
  )
  await config.system.pointer.release(
    config,
    {name: 'b', pointerType: 'mouse'},
    {target: element},
  )
  await config.system.pointer.release(
    config,
    {name: 'b', pointerType: 'mouse'},
    {target: element},
  )
  expect(getEvents('pointerup')).toHaveLength(1)
  expect(getEvents('mouseup')).toHaveLength(1)
})
