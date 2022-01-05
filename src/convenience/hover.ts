import {Instance} from '../setup'

export async function hover(this: Instance, element: Element) {
  return this.pointer({target: element})
}

export async function unhover(this: Instance, element: Element) {
  return this.pointer({target: element.ownerDocument.body})
}
