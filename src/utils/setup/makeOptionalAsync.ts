import {getConfig as getDOMTestingLibraryConfig} from '@testing-library/dom'

interface PromiseAndReturn<T> {
  promise: Promise<void>
  returnValue: T
}

/**
 * Create a function that might void an internal Promise
 *
 * If the implementation should create some return value
 * that is returned by the sync version this must be returned alongside the Promise.
 */
export function makeOptionalAsync<
  ReturnValue extends Promise<void> | PromiseAndReturn<unknown>,
  Impl extends () => ReturnValue,
>(
  /**
   * The asynchronous implementation or a wrapper returning the return data alongside the Promise.
   */
  implementation: Impl,
  /**
   * Determine if the implementation should be treated as sync and the Promise be voided.
   */
  treatAsSync: (this: ThisType<Impl>, ...args: Parameters<Impl>) => boolean,
) {
  function func(this: ThisType<Impl>, ...args: Parameters<Impl>) {
    const implReturn = implementation.apply(this, args)

    const promise =
      implReturn instanceof Promise ? implReturn : implReturn.promise
    const returnValue =
      implReturn instanceof Promise ? void undefined : implReturn.returnValue

    if (treatAsSync.apply(this, args)) {
      // prevent users from dealing with UnhandledPromiseRejectionWarning in sync call
      promise.catch(console.error)

      return returnValue
    } else {
      return getDOMTestingLibraryConfig().asyncWrapper(() =>
        promise.then(() => returnValue),
      )
    }
  }
  func.name = implementation.name
  return func
}
