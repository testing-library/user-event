import {isElementType} from '../misc/isElementType'
import {isContentEditable} from './isContentEditable'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GuardedType<T> = T extends (x: any) => x is infer R ? R : never

export function isEditable(
  element: Element,
): element is
  | GuardedType<typeof isContentEditable>
  | (EditableInputOrTextarea & {readOnly: false}) {
  return (
    (isEditableInputOrTextArea(element) && !element.readOnly) ||
    isContentEditable(element)
  )
}

enum editableInputTypes {
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

export type EditableInputOrTextarea =
  | HTMLTextAreaElement
  | (HTMLInputElement & {type: editableInputTypes})

export function isEditableInputOrTextArea(
  element: Element,
): element is EditableInputOrTextarea {
  return (
    isElementType(element, 'textarea') ||
    (isElementType(element, 'input') && element.type in editableInputTypes)
  )
}
