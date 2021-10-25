import {getConfig as getDOMTestingLibraryConfig} from '@testing-library/dom'
import {prepareDocument} from './document'
import type {UserEvent} from './setup'
import {setSelectionRange} from './utils'
import {keyboardImplementationWrapper} from './keyboard'

export interface typeOptions {
  delay?: number
  skipClick?: boolean
  skipAutoClose?: boolean
  initialSelectionStart?: number
  initialSelectionEnd?: number
}

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
      typeImplementation(this, element, text, {delay, ...options}),
    )
  } else {
    return void typeImplementation(this, element, text, {delay, ...options})
      // prevents users from dealing with UnhandledPromiseRejectionWarning
      .catch(console.error)
  }
}

async function typeImplementation(
  userEvent: UserEvent,
  element: Element,
  text: string,
  {
    delay,
    skipClick = false,
    skipAutoClose = false,
    initialSelectionStart = undefined,
    initialSelectionEnd = undefined,
  }: typeOptions & {delay: number},
): Promise<void> {
  // TODO: properly type guard
  // we use this workaround for now to prevent changing behavior
  if ((element as {disabled?: boolean}).disabled) return

  if (!skipClick) userEvent.click(element)

  if (initialSelectionStart !== undefined) {
    setSelectionRange(
      element,
      initialSelectionStart,
      initialSelectionEnd ?? initialSelectionStart,
    )
  }

  const {promise, releaseAllKeys} = keyboardImplementationWrapper(text, {
    delay,
    document: element.ownerDocument,
  })

  if (delay > 0) {
    await promise
  }

  if (!skipAutoClose) {
    releaseAllKeys()
  }

  // eslint-disable-next-line consistent-return -- we need to return the internal Promise so that it is catchable if we don't await
  return promise
}
