import type {keyboardState} from '../keyboard/types'
import type {pointerState} from '../pointer/types'
import type {Options} from '../options'

export interface inputDeviceState {
  pointerState: pointerState
  keyboardState: keyboardState
}

export interface Config extends Required<Options>, inputDeviceState {}
export const Config = Symbol('Config')
