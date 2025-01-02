import {type Instance} from '../setup'
import {assertPointerEvents} from '../utils'

export async function hover(this: Instance, element: Element) {
  return this.pointer({target: element})
}

export async function unhover(this: Instance, element: Element) {
  assertPointerEvents(this, this.system.pointer.getMouseTarget(this))
  return this.pointer({target: element.ownerDocument.body})
}
