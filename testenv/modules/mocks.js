import { ModuleMocker } from 'jest-mock'

const mocks = new ModuleMocker(globalThis)
globalThis.mocks = mocks
