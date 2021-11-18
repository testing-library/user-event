import type {copyOptions, cutOptions, pasteOptions} from '../clipboard'
import type {clickOptions, tabOptions} from '../convenience'
import type {keyboardOptions, keyboardState} from '../keyboard'
import type {PointerOptions} from '../utils'
import type {typeOptions, uploadInit, uploadOptions} from '../utility'
import type {PointerInput, pointerOptions} from '../pointer'
import {setupDirect} from './setup'
import {Config, inputDeviceState} from './config'

export function clear(element: Element) {
  return setupDirect().clear(element)
}

export function click(
  element: Element,
  options: clickOptions & PointerOptions = {},
) {
  return setupDirect(options, element).click(element)
}

export function copy(options: copyOptions = {}) {
  return setupDirect(options).copy()
}

export function cut(options: cutOptions = {}) {
  return setupDirect(options).cut()
}

export function dblClick(
  element: Element,
  options: clickOptions & PointerOptions = {},
) {
  return setupDirect(options).dblClick(element)
}

export function deselectOptions(
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
  options: PointerOptions = {},
) {
  return setupDirect(options).deselectOptions(select, values, options)
}

export function hover(element: Element, options: PointerOptions = {}) {
  return setupDirect(options).hover(element)
}

export async function keyboard(
  text: string,
  options: Partial<keyboardOptions & {keyboardState: keyboardState}> = {},
) {
  const instance = setupDirect(options)
  const promise = instance.keyboard(text)

  return promise.then(() => instance[Config].keyboardState)
}

export async function pointer(
  input: PointerInput,
  options: Partial<pointerOptions & inputDeviceState> = {},
) {
  const instance = setupDirect(options)
  const promise = instance.pointer(input)

  return promise.then(() => instance[Config].pointerState)
}

export function paste(
  clipboardData?: DataTransfer | string,
  options?: pasteOptions,
) {
  return setupDirect(options).paste(clipboardData)
}

export function selectOptions(
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
  options: PointerOptions = {},
) {
  return setupDirect(options).selectOptions(select, values, options)
}

export function tripleClick(
  element: Element,
  options: clickOptions & PointerOptions = {},
) {
  return setupDirect(options).tripleClick(element)
}

export function type(
  element: Element,
  text: string,
  options: typeOptions = {},
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
  init?: uploadInit,
  options: uploadOptions = {},
) {
  return setupDirect(options).upload(element, fileOrFiles, init)
}

export function tab(options: tabOptions = {}) {
  return setupDirect().tab(options)
}
