import {FakeTimers} from './fakeTimers.js'

const timers = new FakeTimers()
globalThis.timers = timers
