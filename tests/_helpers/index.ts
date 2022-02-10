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

export {setup} from './setup'
export {addEventListener, addListeners} from './listeners'
