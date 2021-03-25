import {isElementType} from '../misc/isElementType'
import {getValue} from './getValue'

enum maxLengthSupportedTypes {
  'email' = 'email',
  'password' = 'password',
  'search' = 'search',
  'telephone' = 'telephone',
  'text' = 'text',
  'url' = 'url',
}

export function getSpaceUntilMaxLength(element: Element) {
  const value = getValue(element)

  /* istanbul ignore if */
  if (value === null) {
    return undefined
  }

  const maxLength = getSanitizedMaxLength(element)

  return maxLength ? maxLength - value.length : undefined
}

// can't use .maxLength property because of a jsdom bug:
// https://github.com/jsdom/jsdom/issues/2927
function getSanitizedMaxLength(element: Element) {
  if (!supportsMaxLength(element)) {
    return undefined
  }

  const attr = element.getAttribute('maxlength') ?? ''

  return /^\d+$/.test(attr) && Number(attr) >= 0 ? Number(attr) : undefined
}

function supportsMaxLength(
  element: Element,
): element is
  | HTMLTextAreaElement
  | (HTMLInputElement & {type: maxLengthSupportedTypes}) {
  return (
    isElementType(element, 'textarea') ||
    (isElementType(element, 'input') &&
      Boolean(
        maxLengthSupportedTypes[
          element.type as keyof typeof maxLengthSupportedTypes
        ],
      ))
  )
}
