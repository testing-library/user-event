import {isElementType} from '../misc/isElementType'

enum clickableInputTypes {
  'button' = 'button',
  'color' = 'color',
  'file' = 'file',
  'image' = 'image',
  'reset' = 'reset',
  'submit' = 'submit',
  'checkbox' = 'checkbox',
  'radio' = 'radio',
}
export type ClickableInputType = keyof typeof clickableInputTypes

export function isClickableInput(
  element: Element,
): element is
  | HTMLButtonElement
  | (HTMLInputElement & {type: clickableInputTypes}) {
  return (
    isElementType(element, 'button') ||
    (isElementType(element, 'input') && element.type in clickableInputTypes)
  )
}
