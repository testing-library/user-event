import dtl from '../_interop/dtl'

const {getConfig} = dtl

/**
 * Wrap an internal Promise
 */
export function wrapAsync<R, P extends (() => Promise<R>) | (() => R)>(
  implementation: P,
): Promise<R> {
  return getConfig().asyncWrapper(implementation)
}
