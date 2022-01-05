import type {Instance} from '../setup'
import {setSelectionRange} from '../utils'
import {releaseAllKeys} from '../keyboard'
import {Config} from '../setup/config'

export interface typeOptions {
  skipClick?: Config['skipClick']
  skipAutoClose?: Config['skipClick']
  initialSelectionStart?: number
  initialSelectionEnd?: number
}

export async function type(
  this: Instance,
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

  await this.keyboard(text)

  if (!skipAutoClose) {
    await releaseAllKeys(this[Config])
  }
}
