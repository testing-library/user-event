import {System} from '..'
import {Instance} from '../../setup'
import {Buttons} from './buttons'
import {Device} from './device'
import {Mouse} from './mouse'
import {Pointer} from './pointer'
import {pointerKey, PointerPosition} from './shared'

export type {pointerKey, PointerPosition} from './shared'

export class PointerHost {
  readonly system: System

  constructor(system: System) {
    this.system = system
    this.buttons = new Buttons()
    this.mouse = new Mouse()
    this.pointers.new('mouse', 'mouse', this.buttons)
  }
  private readonly mouse
  private readonly buttons

  private readonly devices = new (class {
    private registry: {[k in string]?: Device} = {}

    get(k: string) {
      return (this.registry[k] ??= new Device())
    }
  })()

  private readonly pointers = new (class {
    private registry: Record<string, Pointer> = {}
    private nextId = 1

    new(pointerName: string, pointerType: string, buttons: Buttons) {
      const isPrimary =
        pointerType !== 'touch' ||
        !Object.values(this.registry).some(
          p => p.pointerType === 'touch' && !p.isCancelled,
        )

      if (!isPrimary) {
        Object.values(this.registry).forEach(p => {
          if (p.pointerType === pointerType && !p.isCancelled) {
            p.isMultitouch = true
          }
        })
      }

      this.registry[pointerName] = new Pointer(
        {
          pointerId: this.nextId++,
          pointerType,
          isPrimary,
        },
        buttons,
      )

      return this.registry[pointerName]
    }

    get(pointerName: string) {
      if (!this.has(pointerName)) {
        throw new Error(
          `Trying to access pointer "${pointerName}" which does not exist.`,
        )
      }
      return this.registry[pointerName]
    }

    has(pointerName: string) {
      return pointerName in this.registry
    }
  })()

  isKeyPressed(keyDef: pointerKey) {
    return this.devices.get(keyDef.pointerType).isPressed(keyDef)
  }

  async press(
    instance: Instance,
    keyDef: pointerKey,
    position: PointerPosition,
  ) {
    this.devices.get(keyDef.pointerType).addPressed(keyDef)

    this.buttons.down(keyDef)

    const pointerName = this.getPointerName(keyDef)
    const pointer =
      keyDef.pointerType === 'touch'
        ? this.pointers.new(pointerName, keyDef.pointerType, this.buttons)
        : this.pointers.get(pointerName)

    // TODO: deprecate the following implicit setting of position
    pointer.position = position
    if (pointer.pointerType !== 'touch') {
      this.mouse.position = position
    }

    if (pointer.pointerType === 'touch') {
      pointer.init(instance)
    }

    pointer.down(instance, keyDef.button)

    if (pointer.pointerType !== 'touch' && !pointer.isPrevented) {
      this.mouse.down(instance, keyDef, pointer)
    }
  }

  async move(
    instance: Instance,
    pointerName: string,
    position: PointerPosition,
  ) {
    const pointer = this.pointers.get(pointerName)

    // In (some?) browsers this order of events can be observed.
    // This interweaving of events is probably unnecessary.
    // While the order of mouse (or pointer) events is defined per spec,
    // the order in which they interweave/follow on a user interaction depends on the implementation.
    const pointermove = pointer.move(instance, position)
    const mousemove =
      pointer.pointerType === 'touch' || (pointer.isPrevented && pointer.isDown)
        ? undefined
        : this.mouse.move(instance, position)

    pointermove?.leave()
    mousemove?.leave()
    pointermove?.enter()
    mousemove?.enter()
    pointermove?.move()
    mousemove?.move()
  }

  async release(
    instance: Instance,
    keyDef: pointerKey,
    position: PointerPosition,
  ) {
    const device = this.devices.get(keyDef.pointerType)
    device.removePressed(keyDef)

    this.buttons.up(keyDef)

    const pointer = this.pointers.get(this.getPointerName(keyDef))

    // TODO: deprecate the following implicit setting of position
    pointer.position = position
    if (pointer.pointerType !== 'touch') {
      this.mouse.position = position
    }

    if (device.countPressed === 0) {
      pointer.up(instance, keyDef.button)
    }

    if (pointer.pointerType === 'touch') {
      pointer.release(instance)
    }

    if (!pointer.isPrevented) {
      if (pointer.pointerType === 'touch' && !pointer.isMultitouch) {
        const mousemove = this.mouse.move(instance, pointer.position)
        mousemove?.leave()
        mousemove?.enter()
        mousemove?.move()

        this.mouse.down(instance, keyDef, pointer)
      }
      if (!pointer.isMultitouch) {
        const mousemove = this.mouse.move(instance, pointer.position)
        mousemove?.leave()
        mousemove?.enter()
        mousemove?.move()

        this.mouse.up(instance, keyDef, pointer)
      }
    }
  }

  getPointerName(keyDef: pointerKey) {
    return keyDef.pointerType === 'touch' ? keyDef.name : keyDef.pointerType
  }

  getPreviousPosition(pointerName: string) {
    return this.pointers.has(pointerName)
      ? this.pointers.get(pointerName).position
      : undefined
  }

  resetClickCount() {
    this.mouse.resetClickCount()
  }

  getMouseTarget(instance: Instance) {
    return this.mouse.position.target ?? instance.config.document.body
  }

  setMousePosition(position: PointerPosition) {
    this.mouse.position = position
    this.pointers.get('mouse').position = position
  }
}
