export function wait(time?: number) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), time))
}
