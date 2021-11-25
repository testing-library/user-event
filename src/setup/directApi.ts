import type {PointerOptions} from '../utils'
import type {PointerInput} from '../pointer'
import type {UserEventApi} from '.'
import {setupDirect} from './setup'
import {Config} from './config'

export function clear(element: Element) {
  return setupDirect().clear(element)
}

export function click(element: Element, options: Partial<Config> = {}) {
  return setupDirect(options, element).click(element)
}

export function copy(options: Partial<Config> = {}) {
  return setupDirect(options).copy()
}

export function cut(options: Partial<Config> = {}) {
  return setupDirect(options).cut()
}

export function dblClick(element: Element, options: Partial<Config> = {}) {
  return setupDirect(options).dblClick(element)
}

export function deselectOptions(
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
  options: Partial<Config> = {},
) {
  return setupDirect(options).deselectOptions(select, values)
}

export function hover(element: Element, options: Partial<Config> = {}) {
  return setupDirect(options).hover(element)
}

export async function keyboard(text: string, options: Partial<Config> = {}) {
  const instance = setupDirect(options)
  const promise = instance.keyboard(text)

  return promise.then(() => instance[Config].keyboardState)
}

export async function pointer(
  input: PointerInput,
  options: Partial<Config> = {},
) {
  const instance = setupDirect(options)
  const promise = instance.pointer(input)

  return promise.then(() => instance[Config].pointerState)
}

export function paste(
  clipboardData?: DataTransfer | string,
  options?: Partial<Config>,
) {
  return setupDirect(options).paste(clipboardData)
}

export function selectOptions(
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
  options: Partial<Config> = {},
) {
  return setupDirect(options).selectOptions(select, values)
}

export function tripleClick(element: Element, options: Partial<Config> = {}) {
  return setupDirect(options).tripleClick(element)
}

export function type(
  element: Element,
  text: string,
  options: Partial<Config> & Parameters<UserEventApi['type']>[2] = {},
) {
  return setupDirect(options, element).type(element, text, options)
}

export function unhover(element: Element, options: PointerOptions = {}) {
  const instance = setupDirect(options)
  instance[Config].pointerState.position.mouse.target = element

  return instance.unhover(element)
}

export function upload(
  element: HTMLElement,
  fileOrFiles: File | File[],
  options: Partial<Config> = {},
) {
  return setupDirect(options).upload(element, fileOrFiles)
}

export function tab(
  options: Partial<Config> & Parameters<UserEventApi['tab']>[0] = {},
) {
  return setupDirect().tab(options)
}
