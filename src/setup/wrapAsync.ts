import {getConfig} from '@testing-library/dom'

/**
 * Wrap an internal Promise
 */
export function wrapAsync<R, P extends (() => Promise<R>) | (() => R)>(
  implementation: P,
): Promise<R> {
  return getConfig().asyncWrapper(implementation)
}
