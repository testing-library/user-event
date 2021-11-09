import {isElementType} from '../misc/isElementType'
import {isContentEditable} from './isContentEditable'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GuardedType<T> = T extends (x: any) => x is infer R ? R : never

export function isEditable(
  element: Element,
): element is
  | GuardedType<typeof isContentEditable>
  | GuardedType<typeof isEditableInput>
  | (HTMLTextAreaElement & {readOnly: false}) {
  return (
    isEditableInput(element) ||
    isElementType(element, 'textarea', {readOnly: false}) ||
    isContentEditable(element)
  )
}

export enum editableInputTypes {
  'text' = 'text',
  'date' = 'date',
  'datetime-local' = 'datetime-local',
  'email' = 'email',
  'month' = 'month',
  'number' = 'number',
  'password' = 'password',
  'search' = 'search',
  'tel' = 'tel',
  'time' = 'time',
  'url' = 'url',
  'week' = 'week',
}

export type EditableInputType = keyof typeof editableInputTypes

export function isEditableInput(
  element: Element,
): element is HTMLInputElement & {
  readOnly: false
  type: editableInputTypes
} {
  return (
    isElementType(element, 'input', {readOnly: false}) &&
    Boolean(editableInputTypes[element.type as editableInputTypes])
  )
}
