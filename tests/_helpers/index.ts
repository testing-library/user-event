import {CustomElements, registerCustomElements} from './elements'
import {toBeActive} from './toBeActive'

// this is pretty helpful:
// https://codesandbox.io/s/quizzical-worker-eo909

expect.addSnapshotSerializer({
  test: (val: unknown) =>
    Boolean(
      typeof val === 'object'
        ? Object.prototype.hasOwnProperty.call(val, 'snapshot')
        : false,
    ),
  print: val => String((<null | {snapshot?: string}>val)?.snapshot),
})

expect.extend({
  toBeActive,
})
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-invalid-void-type
    interface Matchers<R = void, T = {}> {
      toBeActive: () => void
    }
  }
}

registerCustomElements()

export type {CustomElements}

export {render, setup} from './setup'
export {addEventListener, addListeners} from './listeners'
