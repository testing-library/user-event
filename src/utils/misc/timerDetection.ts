interface FakeClock {
  tick: (ms: number) => void
}

/**
 * Advance fake timers if the test framework installed some.
 *
 * Jest's modern fake timers and Vitest's fake timers are both built on
 * `@sinonjs/fake-timers`, which exposes the installed clock on each timer
 * function it replaces.
 * Looking for that clock instead of a `jest`/`vi` global detects fake timers
 * however the framework is imported, and only while they are installed.
 */
export function advanceFakeTimers(delay: number): void {
  const {clock} = globalThis.setTimeout as typeof globalThis.setTimeout & {
    clock?: FakeClock
  }

  if (typeof clock?.tick === 'function') {
    clock.tick(delay)
  }
}
