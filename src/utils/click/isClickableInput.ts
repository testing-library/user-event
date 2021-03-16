import {isInstanceOfElement} from '../misc/isInstanceOfElement'

const CLICKABLE_INPUT_TYPES = [
  'button',
  'color',
  'file',
  'image',
  'reset',
  'submit',
]

export function isClickableInput(element: Element): boolean {
  return (
    element.tagName === 'BUTTON' ||
    (isInstanceOfElement(element, 'HTMLInputElement') &&
      CLICKABLE_INPUT_TYPES.includes((element as HTMLInputElement).type))
  )
}
