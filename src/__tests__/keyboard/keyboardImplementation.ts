import userEvent from '../../index'
import {setup} from '../helpers/utils'

test('no character input if `altKey` or `ctrlKey` is pressed', () => {
  const {element, eventWasFired} = setup(`<input/>`)
  ;(element as HTMLInputElement).focus()

  userEvent.keyboard('[ControlLeft>]g')

  expect(eventWasFired('keypress')).toBe(false)
  expect(eventWasFired('input')).toBe(false)

  userEvent.keyboard('[AltLeft>]g')

  expect(eventWasFired('keypress')).toBe(false)
  expect(eventWasFired('input')).toBe(false)
})
