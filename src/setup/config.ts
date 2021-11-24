import {keyboardState} from '#src/keyboard/types'
import {pointerState} from '#src/pointer/types'
import {Options} from '#src/options'

export interface inputDeviceState {
  pointerState: pointerState
  keyboardState: keyboardState
}

export interface Config extends Required<Options>, inputDeviceState {}
export const Config = Symbol('Config')
