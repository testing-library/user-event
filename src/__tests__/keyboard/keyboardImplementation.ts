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

describe('fire events', () => {
  it('_a', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)

    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{ArrowLeft>}{ArrowLeft}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value=""]

input[value=""] - keydown: ArrowLeft (37)
input[value=""] - select
input[value=""] - keyup: ArrowLeft (37)
input[value=""] - keydown: ArrowLeft (37)
input[value=""] - select
input[value=""] - keyup: ArrowLeft (37)
`)
  })

  it('fires event without releasing key', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)

    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{a>}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="a"]

input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
`)
  })

  it('fires event multiple times without releasing key', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{a>2}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="a"]

input[value=""] - keydown: a (97)
input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
`)
  })

  it('fires event multiple times and releases key', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{a>2}{/a}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="a"]

input[value=""] - keydown: a (97)
input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keyup: a (97)
`)
  })

  it('fires event multiple times for multiple keys without releasing any of them', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{a>2}{b>2}{c>2}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="abc"]

input[value=""] - keydown: a (97)
input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keydown: b (98)
input[value="a"] - keydown: b (98)
input[value="a"] - keypress: b (98)
input[value="a"] - keypress: b (98)
input[value="ab"] - input
input[value="ab"] - keydown: c (99)
input[value="ab"] - keydown: c (99)
input[value="ab"] - keypress: c (99)
input[value="ab"] - keypress: c (99)
input[value="abc"] - input
`)
  })

  it('fires event multiple times for multiple keys with releasing some of them', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{a>2}{b>2}{/a}{/b}{c>2}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="abc"]

input[value=""] - keydown: a (97)
input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keydown: b (98)
input[value="a"] - keydown: b (98)
input[value="a"] - keypress: b (98)
input[value="a"] - keypress: b (98)
input[value="ab"] - input
input[value="ab"] - keyup: a (97)
input[value="ab"] - keyup: b (98)
input[value="ab"] - keydown: c (99)
input[value="ab"] - keydown: c (99)
input[value="ab"] - keypress: c (99)
input[value="ab"] - keypress: c (99)
input[value="abc"] - input
`)
  })

  it('fires event multiple times and releases only last keys', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{a>2}b')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="ab"]

input[value=""] - keydown: a (97)
input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keydown: b (98)
input[value="a"] - keypress: b (98)
input[value="ab"] - input
input[value="ab"] - keyup: b (98)
`)
  })

  it('fires event multiple times and releases all keys', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{a>2}b{/a}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="ab"]

input[value=""] - keydown: a (97)
input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keydown: b (98)
input[value="a"] - keypress: b (98)
input[value="ab"] - input
input[value="ab"] - keyup: b (98)
input[value="ab"] - keyup: a (97)
`)
  })
})
