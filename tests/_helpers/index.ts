// this is pretty helpful:
// https://codesandbox.io/s/quizzical-worker-eo909

export {render, setup} from './setup'
export {addEventListener, addListeners} from './listeners'

export function isJsdomEnv() {
  return window.navigator.userAgent.includes(' jsdom/')
}
