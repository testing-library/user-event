import {getConfig as getDOMTestingLibraryConfig} from '@testing-library/dom'
import {prepareDocument} from '../document'
import type {UserEvent} from '../setup'
import {typeImplementation, typeOptions} from './typeImplementation'

export function type(
  this: UserEvent,
  element: Element,
  text: string,
  options?: typeOptions & {delay?: 0},
): void
export function type(
  this: UserEvent,
  element: Element,
  text: string,
  options: typeOptions & {delay: number},
): Promise<void>
// this needs to be wrapped in the event/asyncWrapper for React's act and angular's change detection
// depending on whether it will be async.
export function type(
  this: UserEvent,
  element: Element,
  text: string,
  {delay = 0, ...options}: typeOptions = {},
): Promise<void> | void {
  prepareDocument(element.ownerDocument)

  // we do not want to wrap in the asyncWrapper if we're not
  // going to actually be doing anything async, so we only wrap
  // if the delay is greater than 0

  if (delay > 0) {
    return getDOMTestingLibraryConfig().asyncWrapper(() =>
      typeImplementation.call(this, element, text, {delay, ...options}),
    )
  } else {
    return void typeImplementation
      .call(this, element, text, {delay, ...options})
      // prevents users from dealing with UnhandledPromiseRejectionWarning
      .catch(console.error)
  }
}
