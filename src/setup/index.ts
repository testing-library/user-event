import type * as userEventApi from './api'
import {setupMain, setupSub} from './setup'
import {Config, inputDeviceState} from './config'
import * as directApi from './directApi'

export type {inputDeviceState}
export {Config}

export type UserEventApi = typeof userEventApi

export type UserEvent = UserEventApi & {
  readonly setup: typeof setupSub
  [Config]: Config
}

export const userEvent = {
  ...directApi,
  setup: setupMain,
} as const
