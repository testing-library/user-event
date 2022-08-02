import type {Options} from '../options'
import {System} from '../system'

export interface Config extends Required<Options> {
  system: System
}
export const Config = Symbol('Config')
