import {createConfig, createInstance} from '#src/setup/setup'
import {render} from '#testHelpers'

test('ensure sanity on multiple down/up calls', async () => {
  const {element, getEvents} = render(`<button></button>`)
  const {instance} = createInstance(createConfig())

  await instance.system.pointer.press(
    instance,
    {name: 'a', pointerType: 'mouse'},
    {target: element},
  )
  await instance.system.pointer.press(
    instance,
    {name: 'b', pointerType: 'mouse'},
    {target: element},
  )
  await instance.system.pointer.press(
    instance,
    {name: 'b', pointerType: 'mouse'},
    {target: element},
  )
  expect(getEvents('pointerdown')).toHaveLength(1)
  expect(getEvents('mousedown')).toHaveLength(1)

  await instance.system.pointer.release(
    instance,
    {name: 'a', pointerType: 'mouse'},
    {target: element},
  )
  await instance.system.pointer.release(
    instance,
    {name: 'b', pointerType: 'mouse'},
    {target: element},
  )
  await instance.system.pointer.release(
    instance,
    {name: 'b', pointerType: 'mouse'},
    {target: element},
  )
  expect(getEvents('pointerup')).toHaveLength(1)
  expect(getEvents('mouseup')).toHaveLength(1)
})
