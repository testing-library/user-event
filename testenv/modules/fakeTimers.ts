/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
  FakeTimerWithContext,
  InstalledClock,
  FakeTimerInstallOpts,
  withGlobal,
} from '@sinonjs/fake-timers'

export class FakeTimers {
  protected readonly fakeTimers: FakeTimerWithContext
  protected clock?: InstalledClock

  constructor(context: typeof globalThis = globalThis) {
    this.fakeTimers = withGlobal(context)
  }

  clearAllTimers(): void {
    this.clock?.reset()
  }

  dispose(): void {
    this.useRealTimers()
  }

  runAllTimers(): void {
    this.clock?.runAll()
  }

  runOnlyPendingTimers(): void {
    this.clock?.runToLast()
  }

  advanceTimersToNextTimer(steps = 1): void {
    this.assertFakeTimers()
    for (let i = steps; i > 0; i--) {
      this.clock!.next()
      // Fire all timers at this point: https://github.com/sinonjs/fake-timers/issues/250
      this.clock!.tick(0)

      if (this.clock!.countTimers() === 0) {
        break
      }
    }
  }

  advanceTimersByTime(msToRun: number): void {
    this.assertFakeTimers()
    this.clock!.tick(msToRun)
  }

  runAllTicks(): void {
    this.assertFakeTimers()
    // @ts-expect-error - doesn't exist?
    this.clock!.runMicrotasks()
  }

  useRealTimers(): void {
    this.clock?.uninstall()
    delete this.clock
  }

  useFakeTimers(fakeTimersConfig?: FakeTimerInstallOpts): void {
    if (this.clock) {
      this.clock.uninstall()
      delete this.clock
    }

    this.clock = this.fakeTimers.install(fakeTimersConfig)
  }

  reset(): void {
    this.assertFakeTimers()
    const now = this.clock!.now
    this.clock!.reset()
    this.clock!.setSystemTime(now)
  }

  setSystemTime(now?: number | Date): void {
    this.assertFakeTimers()
    this.clock!.setSystemTime(now)
  }

  getRealSystemTime(): number {
    return Date.now()
  }

  now(): number {
    return this.clock?.now ?? Date.now()
  }

  getTimerCount(): number {
    this.assertFakeTimers()
    return this.clock!.countTimers()
  }

  protected assertFakeTimers() {
    if (!this.clock) {
      throw new Error(
        'A function that relies on fake timers was called, but the timers APIs are not replaced with fake timers.',
      )
    }
  }
}
