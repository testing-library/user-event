import {isElementType} from '../misc/isElementType'

const CLICKABLE_INPUT_TYPES = [
  'button',
  'color',
  'file',
  'image',
  'reset',
  'submit',
  'checkbox',
  'radio',
]

export function isClickableInput(element: Element): boolean {
  return (
    isElementType(element, 'button') ||
    (isElementType(element, 'input') &&
      CLICKABLE_INPUT_TYPES.includes(element.type))
  )
}
