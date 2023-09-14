import {type Instance} from '../../setup'

export enum ApiLevel {
  Trigger = 2,
  Call = 1,
}

export type LevelRefs = Record<ApiLevel, object | undefined>

export function setLevelRef(instance: Instance, level: ApiLevel) {
  instance.levelRefs[level] = {}
}

export function getLevelRef(instance: Instance, level: ApiLevel) {
  return instance.levelRefs[level]
}
