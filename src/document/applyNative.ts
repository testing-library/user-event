/**
 * React tracks the changes on element properties.
 * This workaround tries to alter the DOM element without React noticing,
 * so that it later picks up the change.
 *
 * @see https://github.com/facebook/react/blob/148f8e497c7d37a3c7ab99f01dec2692427272b1/packages/react-dom/src/client/inputValueTracking.js#L51-L104
 */
export function applyNative<T extends Element, P extends keyof T>(
  element: T,
  propName: P,
  propValue: T[P],
) {
  const descriptor = Object.getOwnPropertyDescriptor(element, propName)
  const nativeDescriptor = Object.getOwnPropertyDescriptor(
    element.constructor.prototype,
    propName,
  )

  if (descriptor && nativeDescriptor) {
    Object.defineProperty(element, propName, nativeDescriptor)
  }

  element[propName] = propValue

  if (descriptor) {
    Object.defineProperty(element, propName, descriptor)
  }
}
