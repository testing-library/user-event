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

describe('pressing and releasing keys', () => {
  it('fires event with releasing key twice', () => {
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
Events fired on: input[value="aa"]

input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keydown: a (97)
input[value="a"] - keypress: a (97)
input[value="aa"] - input
`)
  })

  it('fires event multiple times and releases key', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{a>2/}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="aa"]

input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keydown: a (97)
input[value="a"] - keypress: a (97)
input[value="aa"] - input
input[value="aa"] - keyup: a (97)
`)
  })

  it('fires event multiple times for multiple keys', () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    userEvent.keyboard('{a>2}{b>2/}{c>2}{/a}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
Events fired on: input[value="aabbcc"]

input[value=""] - keydown: a (97)
input[value=""] - keypress: a (97)
input[value="a"] - input
input[value="a"] - keydown: a (97)
input[value="a"] - keypress: a (97)
input[value="aa"] - input
input[value="aa"] - keydown: b (98)
input[value="aa"] - keypress: b (98)
input[value="aab"] - input
input[value="aab"] - keydown: b (98)
input[value="aab"] - keypress: b (98)
input[value="aabb"] - input
input[value="aabb"] - keyup: b (98)
input[value="aabb"] - keydown: c (99)
input[value="aabb"] - keypress: c (99)
input[value="aabbc"] - input
input[value="aabbc"] - keydown: c (99)
input[value="aabbc"] - keypress: c (99)
input[value="aabbcc"] - input
input[value="aabbcc"] - keyup: a (97)
`)
  })
})
