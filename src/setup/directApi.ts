import type {PointerInput} from '../pointer'
import type {UserEventApi} from '.'
import {setupDirect} from './setup'
import {Config} from './config'

export function clear(element: Element) {
  return setupDirect().api.clear(element)
}

export function click(element: Element, options: Partial<Config> = {}) {
  return setupDirect(options, element).api.click(element)
}

export function copy(options: Partial<Config> = {}) {
  return setupDirect(options).api.copy()
}

export function cut(options: Partial<Config> = {}) {
  return setupDirect(options).api.cut()
}

export function dblClick(element: Element, options: Partial<Config> = {}) {
  return setupDirect(options).api.dblClick(element)
}

export function deselectOptions(
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
  options: Partial<Config> = {},
) {
  return setupDirect(options).api.deselectOptions(select, values)
}

export function hover(element: Element, options: Partial<Config> = {}) {
  return setupDirect(options).api.hover(element)
}

export async function keyboard(text: string, options: Partial<Config> = {}) {
  const {config, api} = setupDirect(options)

  return api.keyboard(text).then(() => config.keyboardState)
}

export async function pointer(
  input: PointerInput,
  options: Partial<Config> = {},
) {
  const {config, api} = setupDirect(options)

  return api.pointer(input).then(() => config.pointerState)
}

export function paste(
  clipboardData?: DataTransfer | string,
  options?: Partial<Config>,
) {
  return setupDirect(options).api.paste(clipboardData)
}

export function selectOptions(
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
  options: Partial<Config> = {},
) {
  return setupDirect(options).api.selectOptions(select, values)
}

export function tripleClick(element: Element, options: Partial<Config> = {}) {
  return setupDirect(options).api.tripleClick(element)
}

export function type(
  element: Element,
  text: string,
  options: Partial<Config> & Parameters<UserEventApi['type']>[2] = {},
) {
  return setupDirect(options, element).api.type(element, text, options)
}

export function unhover(element: Element, options: Partial<Config> = {}) {
  const {config, api} = setupDirect(options)
  config.pointerState.position.mouse.target = element

  return api.unhover(element)
}

export function upload(
  element: HTMLElement,
  fileOrFiles: File | File[],
  options: Partial<Config> = {},
) {
  return setupDirect(options).api.upload(element, fileOrFiles)
}

export function tab(
  options: Partial<Config> & Parameters<UserEventApi['tab']>[0] = {},
) {
  return setupDirect().api.tab(options)
}
