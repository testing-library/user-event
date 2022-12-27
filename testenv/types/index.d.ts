import type { Expect } from 'expect'
import type { ModuleMocker } from 'jest-mock'
import type { SnapshotMatchers } from 'jest-snapshot'
import type { FakeTimers } from '../modules/fakeTimers'
import type { TestContext } from '@ph.fritsche/toolbox'

type M<E, R> = import('@testing-library/jest-dom/matchers').TestingLibraryMatchers<E, R>

declare module 'expect' {
    export interface Matchers<R = void, T = {}> extends
        M<Expect['stringContaining'], R>,
        SnapshotMatchers<R, T>
    {}
}

declare global {
    declare var expect: Expect
    
    declare var mocks: ModuleMocker
    
    declare var timers: FakeTimers
    
    declare var describe: TestContext['describe']
    declare var test: TestContext['test']
    declare var beforeAll: TestContext['beforeAll']
    declare var beforeEach: TestContext['beforeEach']
    declare var afterAll: TestContext['afterAll']
    declare var afterEach: TestContext['afterEach']
}
