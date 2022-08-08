import type {Options} from '../options'
import type {PointerInput} from '../pointer'
import type {System} from '../system'
import type {UserEventApi} from './setup'
import {setupDirect} from './setup'

export type DirectOptions = Options & {
  keyboardState?: System
  pointerState?: System
}

export function clear(element: Element) {
  return setupDirect().api.clear(element)
}

export function click(element: Element, options: DirectOptions = {}) {
  return setupDirect(options, element).api.click(element)
}

export function copy(options: DirectOptions = {}) {
  return setupDirect(options).api.copy()
}

export function cut(options: DirectOptions = {}) {
  return setupDirect(options).api.cut()
}

export function dblClick(element: Element, options: DirectOptions = {}) {
  return setupDirect(options).api.dblClick(element)
}

export function deselectOptions(
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
  options: DirectOptions = {},
) {
  return setupDirect(options).api.deselectOptions(select, values)
}

export function hover(element: Element, options: DirectOptions = {}) {
  return setupDirect(options).api.hover(element)
}

export async function keyboard(text: string, options: DirectOptions = {}) {
  const {api, system} = setupDirect(options)

  return api.keyboard(text).then(() => system)
}

export async function pointer(
  input: PointerInput,
  options: DirectOptions = {},
) {
  const {api, system} = setupDirect(options)

  return api.pointer(input).then(() => system)
}

export function paste(
  clipboardData?: DataTransfer | string,
  options?: DirectOptions,
) {
  return setupDirect(options).api.paste(clipboardData)
}

export function selectOptions(
  select: Element,
  values: HTMLElement | HTMLElement[] | string[] | string,
  options: DirectOptions = {},
) {
  return setupDirect(options).api.selectOptions(select, values)
}

export function tripleClick(element: Element, options: DirectOptions = {}) {
  return setupDirect(options).api.tripleClick(element)
}

export function type(
  element: Element,
  text: string,
  options: DirectOptions & Parameters<UserEventApi['type']>[2] = {},
) {
  return setupDirect(options, element).api.type(element, text, options)
}

export function unhover(element: Element, options: DirectOptions = {}) {
  const {api, system} = setupDirect(options)
  system.pointer.setMousePosition({target: element})

  return api.unhover(element)
}

export function upload(
  element: HTMLElement,
  fileOrFiles: File | File[],
  options: DirectOptions = {},
) {
  return setupDirect(options).api.upload(element, fileOrFiles)
}

export function tab(
  options: DirectOptions & Parameters<UserEventApi['tab']>[0] = {},
) {
  return setupDirect().api.tab(options)
}
