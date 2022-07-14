import {Config} from '../../setup'

export enum ApiLevel {
  Trigger = 2,
  Call = 1,
}

const Level = Symbol('Api level refs')
interface LevelRefs {
  [k: number]: object | undefined
}
declare module '../../setup' {
  interface Config {
    [Level]?: LevelRefs
  }
}

export function setLevelRef(config: Config, level: ApiLevel) {
  config[Level] ??= {}
  config[Level][level] = {}
}

export function getLevelRef(config: Config, level: ApiLevel) {
  return config[Level]?.[level]
}
