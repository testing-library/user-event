declare namespace jest {
  // eslint-disable-next-line
  export interface MockContext<T, Y extends any[]> {
    // mock.lastCall has been introduced in jest@27.5 but is still missing in @types/jest
    lastCall: Y | undefined
  }
}
