import {isElementType} from '../misc/isElementType'

enum maxLengthSupportedTypes {
  'email' = 'email',
  'password' = 'password',
  'search' = 'search',
  'telephone' = 'telephone',
  'text' = 'text',
  'url' = 'url',
}

type ElementWithMaxLengthSupport =
  | HTMLTextAreaElement
  | (HTMLInputElement & {type: maxLengthSupportedTypes})

// can't use .maxLength property because of a jsdom bug:
// https://github.com/jsdom/jsdom/issues/2927
export function getMaxLength(element: ElementWithMaxLengthSupport) {
  const attr = element.getAttribute('maxlength') ?? ''

  return /^\d+$/.test(attr) && Number(attr) >= 0 ? Number(attr) : undefined
}

export function supportsMaxLength(
  element: Element,
): element is ElementWithMaxLengthSupport {
  return (
    isElementType(element, 'textarea') ||
    (isElementType(element, 'input') && element.type in maxLengthSupportedTypes)
  )
}
