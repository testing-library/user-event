import {isElementType} from '../misc/isElementType'

enum unreliableValueInputTypes {
  'number' = 'number',
}

/**
 * Check if an empty IDL value on the element could mean a derivation of displayed value and IDL value
 */
export function hasUnreliableEmptyValue(
  element: Element,
): element is HTMLInputElement & {type: unreliableValueInputTypes} {
  return (
    isElementType(element, 'input') &&
    Boolean(
      unreliableValueInputTypes[
        element.type as keyof typeof unreliableValueInputTypes
      ],
    )
  )
}
