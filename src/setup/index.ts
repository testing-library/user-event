import type {bindDispatchUIEvent} from '../event'
import type * as userEventApi from './api'
import {setupMain, setupSub} from './setup'
import {Config, inputDeviceState} from './config'
import * as directApi from './directApi'

export type {inputDeviceState}
export {Config}

export type UserEventApi = typeof userEventApi

export type Instance = UserEventApi & {
  [Config]: Config
  dispatchUIEvent: ReturnType<typeof bindDispatchUIEvent>
}

export type UserEvent = {
  readonly setup: (...args: Parameters<typeof setupSub>) => UserEvent
} & {
  readonly [k in keyof UserEventApi]: (
    ...args: Parameters<UserEventApi[k]>
  ) => ReturnType<UserEventApi[k]>
}

export const userEvent = {
  ...directApi,
  setup: setupMain,
} as const
