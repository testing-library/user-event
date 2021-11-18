import type {UserEvent} from '../setup'
import {setSelectionRange} from '../utils'
import {releaseAllKeys} from '../keyboard'
import {Config} from '../setup/config'

export interface typeOptions {
  delay?: number | null
  skipClick?: boolean
  skipAutoClose?: boolean
  initialSelectionStart?: number
  initialSelectionEnd?: number
}

export async function type(
  this: UserEvent,
  element: Element,
  text: string,
  {
    skipClick = this[Config].skipClick,
    skipAutoClose = this[Config].skipAutoClose,
    initialSelectionStart,
    initialSelectionEnd,
  }: typeOptions = {},
): Promise<void> {
  // TODO: properly type guard
  // we use this workaround for now to prevent changing behavior
  if ((element as {disabled?: boolean}).disabled) return

  if (!skipClick) {
    await this.click(element)
  }

  if (initialSelectionStart !== undefined) {
    setSelectionRange(
      element,
      initialSelectionStart,
      initialSelectionEnd ?? initialSelectionStart,
    )
  }

  const promise = this.keyboard(text)

  await promise

  if (!skipAutoClose) {
    releaseAllKeys(this[Config], this[Config].keyboardState)
  }

  return promise
}
