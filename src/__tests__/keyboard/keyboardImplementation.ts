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

describe('fire multiple events for', () => {
  describe('keydown', () => {
    it('_a', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{ArrowLeft>}{ArrowLeft}')

      expect(spy).toBeCalledTimes(2)
      expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value=""]

input[value=""] - keydown: ArrowLeft (37)
input[value=""] - select
input[value=""] - keyup: ArrowLeft (37)
input[value=""] - keydown: ArrowLeft (37)
input[value=""] - select
input[value=""] - keyup: ArrowLeft (37)
`)

      element?.removeEventListener('keydown', spy)
    })

    it('a', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{a}')

      expect(spy).toBeCalledTimes(1)
      expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="a"]

input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keyup: a (97)
`)

      element?.removeEventListener('keydown', spy)
    })

    it('b', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{a>}')

      expect(spy).toBeCalledTimes(1)
      expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="a"]

input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
`)

      element?.removeEventListener('keydown', spy)
    })

    it('c', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{a>2}')

      expect(spy).toBeCalledTimes(2)
      expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="a"]

input[value=""] - keydown: a (97)
input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
`)

      element?.removeEventListener('keydown', spy)
    })

    it('d', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{a>2}b')

      expect(spy).toBeCalledTimes(3)
      expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="ab"]

input[value=""] - keydown: a (97)
input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keydown: b (98)
input[value="a"] - keypress: b (98)
input[value="ab"] - input
input[value="ab"] - keyup: b (98)
`)

      element?.removeEventListener('keydown', spy)
    })

    it('e', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{a>2}b{/a}')

      expect(spy).toBeCalledTimes(3)
      expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="ab"]

input[value=""] - keydown: a (97)
input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keydown: b (98)
input[value="a"] - keypress: b (98)
input[value="ab"] - input
input[value="ab"] - keyup: b (98)
input[value="ab"] - keyup: a (97)
`)

      element?.removeEventListener('keydown', spy)
    })
  })
})
