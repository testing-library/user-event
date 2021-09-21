import userEvent from '../../index'
import {setup} from '../helpers/utils'

test('no character input if `altKey` or `ctrlKey` is pressed', () => {
  const {element, eventWasFired, getClickEventsSnapshot} = setup(`<input/>`)
  ;(element as HTMLInputElement).focus()

  userEvent.keyboard('[ControlLeft>]g')

  expect(eventWasFired('keypress')).toBe(false)
  expect(eventWasFired('input')).toBe(false)

  userEvent.keyboard('[AltLeft>]g')

  expect(eventWasFired('keypress')).toBe(false)
  expect(eventWasFired('input')).toBe(false)

  console.log(getClickEventsSnapshot())
})

describe('fire multiple events for', () => {
  describe('keydown', () => {
    it('a', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{a}')

      expect(spy).toBeCalledTimes(1)
      expect((element as HTMLInputElement).value).toBe('a')

      element?.removeEventListener('keydown', spy)

      // console.log(getEventSnapshot())
    })

    it('b', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{a>}')

      expect(spy).toBeCalledTimes(1)
      expect((element as HTMLInputElement).value).toBe('a')

      element?.removeEventListener('keydown', spy)

      // console.log(getEventSnapshot())
    })

    it('c', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{a>2}')

      expect(spy).toBeCalledTimes(2)
      expect((element as HTMLInputElement).value).toBe('a')

      element?.removeEventListener('keydown', spy)
    })

    it('d', () => {
      const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
      const spy = jest.fn()

      ;(element as HTMLInputElement).focus()
      element?.addEventListener('keydown', spy)
      clearEventCalls()

      userEvent.keyboard('{a>2}a')

      expect(spy).toBeCalledTimes(3)
      expect((element as HTMLInputElement).value).toBe('aa')

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
      expect((element as HTMLInputElement).value).toBe('ab')

      element?.removeEventListener('keydown', spy)
    })
  })
})
