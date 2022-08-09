import type {PointerInput} from '../pointer'
import type {Instance} from '../setup'

export async function click(this: Instance, element: Element): Promise<void> {
  const pointerIn: PointerInput = []
  if (!this.config.skipHover) {
    pointerIn.push({target: element})
  }
  pointerIn.push({keys: '[MouseLeft]', target: element})

  return this.pointer(pointerIn)
}

export async function dblClick(
  this: Instance,
  element: Element,
): Promise<void> {
  return this.pointer([{target: element}, '[MouseLeft][MouseLeft]'])
}

export async function tripleClick(
  this: Instance,
  element: Element,
): Promise<void> {
  return this.pointer([{target: element}, '[MouseLeft][MouseLeft][MouseLeft]'])
}
