import {type pointerKey} from '.'

export class Device {
  private pressedKeys = new Set<string>()

  get countPressed() {
    return this.pressedKeys.size
  }

  isPressed(keyDef: pointerKey) {
    return this.pressedKeys.has(keyDef.name)
  }

  addPressed(keyDef: pointerKey) {
    return this.pressedKeys.add(keyDef.name)
  }

  removePressed(keyDef: pointerKey) {
    return this.pressedKeys.delete(keyDef.name)
  }
}
