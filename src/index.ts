// the default export is kept for backward compatibility only...
export {userEvent as default} from './setup'

export {userEvent, prepare, reset, detach} from './setup'
export type {UserEvent} from './setup/setup'
export type {keyboardKey} from './system/keyboard'
export type {pointerKey} from './system/pointer'
export {PointerEventsCheckLevel, type Options} from './options'

import {reset, detach} from './setup'

const g = globalThis as {
  afterEach?: (cb?: () => void) => void
  afterAll?: (cb?: () => void) => void
  window?: Window & typeof globalThis
}

if (typeof g.afterEach === 'function') {
  g.afterEach(() => {
    if (g.window) {
      reset(g.window)
    }
  })
}

if (typeof g.afterAll === 'function') {
  g.afterAll(() => {
    if (g.window) {
      detach(g.window)
    }
  })
}
