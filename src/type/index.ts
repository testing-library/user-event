import {getConfig as getDOMTestingLibraryConfig} from '@testing-library/dom'
import {typeImplementation, typeOptions} from './typeImplementation'

// this needs to be wrapped in the event/asyncWrapper for React's act and angular's change detection
// depending on whether it will be async.
export function type(
  element: Element,
  text: string,
  {delay = 0, ...options}: typeOptions = {},
): Promise<void> {
  // we do not want to wrap in the asyncWrapper if we're not
  // going to actually be doing anything async, so we only wrap
  // if the delay is greater than 0
  if (delay > 0) {
    return getDOMTestingLibraryConfig().asyncWrapper(async () => {
      await typeImplementation(element, text, {delay, ...options})
    })
  } else {
    return typeImplementation(element, text, {delay, ...options})
  }
}

export {specialCharMap} from './specialCharMap'
