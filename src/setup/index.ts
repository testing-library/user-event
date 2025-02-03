import {setupMain} from './setup'
import * as directApi from './directApi'

export type {Instance} from './setup'

export const userEvent = {
  ...directApi,
  setup: setupMain,
} as const

export {
  prepare,
  reset,
  detach,
} from './setup'
