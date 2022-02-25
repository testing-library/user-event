import {isEditable} from '#src/utils'
import {render} from '#testHelpers'

test.each([
  [`<input readonly value="foo"/>`],
  [`<input type="color" value="#ffffff" />`],
  [`<input type="image" value="foo" />`],
  [`<input type="button" value="foo"/>`],
  [`<input type="reset" value="foo" />`],
  [`<input type="submit" value="foo" />`],
  [`<input type="file" />`],
  [`<button value="foo" />`],
  [`<div tabIndex="-1"/>`],
  [`<div tabIndex="-1" contenteditable="false"/>`],
])('consider %s a non-editable element', html => {
  const {element} = render(html)

  expect(isEditable(element)).toBe(false)
})

test.each([
  [`<input/>`],
  [`<textarea></textarea>`],
  [`<div contenteditable></div>`],
  [`<div contenteditable="true"></div>`],
])('consider %s an editable element', html => {
  const {element} = render(html)

  expect(isEditable(element)).toBe(true)
})
