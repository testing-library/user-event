// this is pretty helpful:
// https://codesandbox.io/s/quizzical-worker-eo909

import {configure, getConfig} from '@testing-library/dom'

export {render, setup} from './setup'
export {addEventListener, addListeners} from './listeners'

export function isJsdomEnv() {
  return window.navigator.userAgent.includes(' jsdom/')
}

/**
 * Reset the DTL wrappers
 *
 * Framework libraries configure the wrappers in DTL as side effect when being imported.
 * In the Toolbox testenvs that side effect is triggered by including the library as a setup file.
 */
export function resetWrappers() {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const {asyncWrapper, eventWrapper} = {...getConfig()}

  configure({
    asyncWrapper: (cb: () => Promise<unknown>) => cb(),
    eventWrapper: (cb: () => void) => cb(),
  })

  return () => configure({
    asyncWrapper,
    eventWrapper,
  })
}
