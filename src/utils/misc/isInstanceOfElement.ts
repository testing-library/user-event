import {getWindowFromNode} from '@testing-library/dom/dist/helpers'

// isInstanceOfElement can be removed once the peerDependency for @testing-library/dom is bumped to a version that includes https://github.com/testing-library/dom-testing-library/pull/885
/**
 * Check if an element is of a given type.
 *
 * @param {Element} element The element to test
 * @param {string} elementType Constructor name. E.g. 'HTMLSelectElement'
 */
export function isInstanceOfElement(
  element: Element,
  elementType: string,
  // TODO: make this a type guard
  // This should be typed as a type guard, but there is no map with constructor names to element constructors.
  // Window does not have the constructors as properties.
): boolean {
  try {
    // Window usually has the element constructors as properties but is not required to do so per specs
    const constructor = getWindowFromNode(element)[
      elementType as keyof Window
    ] as unknown
    if (typeof constructor === 'function') {
      return element instanceof constructor
    }
  } catch {
    // The document might not be associated with a window
  }

  // Fall back to the constructor name as workaround for test environments that
  // a) not associate the document with a window
  // b) not provide the constructor as property of window
  if (/^HTML(\w+)Element$/.test(element.constructor.name)) {
    return element.constructor.name === elementType
  }

  // The user passed some node that is not created in a browser-like environment
  throw new Error(
    `Unable to verify if element is instance of ${elementType}. Please file an issue describing your test environment: https://github.com/testing-library/dom-testing-library/issues/new`,
  )
}
