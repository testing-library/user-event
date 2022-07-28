import {System} from '..'
import {PointerCoords} from '../../event'
import {Config} from '../../setup'
import {Buttons, MouseButton} from './buttons'
import {Device} from './device'
import {Mouse} from './mouse'
import {Pointer} from './pointer'

export interface pointerKey {
  /** Name of the pointer key */
  name: string
  /** Type of the pointer device */
  pointerType: 'mouse' | 'pen' | 'touch'
  /** Type of button */
  button?: MouseButton
}

export interface PointerPosition {
  target?: Element
  coords?: PointerCoords
  caret?: CaretPosition
}

export interface CaretPosition {
  node?: Node
  offset?: number
}

export class PointerHost {
  readonly system: System

  constructor(system: System) {
    this.system = system
    this.buttons = new Buttons()
    this.mouse = new Mouse()
  }
  private readonly mouse
  private readonly buttons

  private readonly devices = new (class {
    private registry = {} as Record<string, Device>

    get(k: string) {
      this.registry[k] ??= new Device()
      return this.registry[k]
    }
  })()

  private readonly pointers = new (class {
    private registry = {
      mouse: new Pointer({
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
      }),
    } as Record<string, Pointer>
    private nextId = 2

    new(pointerName: string, keyDef: pointerKey) {
      const isPrimary =
        keyDef.pointerType !== 'touch' ||
        !Object.values(this.registry).some(
          p => p.pointerType === 'touch' && !p.isCancelled,
        )

      if (!isPrimary) {
        Object.values(this.registry).forEach(p => {
          if (p.pointerType === keyDef.pointerType && !p.isCancelled) {
            p.isMultitouch = true
          }
        })
      }

      this.registry[pointerName] = new Pointer({
        pointerId: this.nextId++,
        pointerType: keyDef.pointerType,
        isPrimary,
      })

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

  async press(config: Config, keyDef: pointerKey, position: PointerPosition) {
    const pointerName = this.getPointerName(keyDef)
    const pointer =
      keyDef.pointerType === 'touch'
        ? this.pointers.new(pointerName, keyDef).init(config, position)
        : this.pointers.get(pointerName)

    // TODO: deprecate the following implicit setting of position
    pointer.position = position
    if (pointer.pointerType !== 'touch') {
      this.mouse.position = position
    }

    this.devices.get(keyDef.pointerType).addPressed(keyDef)

    this.buttons.down(keyDef)
    pointer.down(config, keyDef)

    if (pointer.pointerType !== 'touch' && !pointer.isPrevented) {
      this.mouse.down(config, keyDef, pointer)
    }
  }

  async move(config: Config, pointerName: string, position: PointerPosition) {
    const pointer = this.pointers.get(pointerName)

    // In (some?) browsers this order of events can be observed.
    // This interweaving of events is probably unnecessary.
    // While the order of mouse (or pointer) events is defined per spec,
    // the order in which they interweave/follow on a user interaction depends on the implementation.
    const pointermove = pointer.move(config, position)
    const mousemove =
      pointer.pointerType === 'touch' || (pointer.isPrevented && pointer.isDown)
        ? undefined
        : this.mouse.move(config, position)

    pointermove?.leave()
    mousemove?.leave()
    pointermove?.enter()
    mousemove?.enter()
    pointermove?.move()
    mousemove?.move()
  }

  async release(config: Config, keyDef: pointerKey, position: PointerPosition) {
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
      pointer.up(config, keyDef)
    }

    if (pointer.pointerType === 'touch') {
      pointer.release(config)
    }

    if (!pointer.isPrevented) {
      if (pointer.pointerType === 'touch' && !pointer.isMultitouch) {
        const mousemove = this.mouse.move(config, pointer.position)
        mousemove?.leave()
        mousemove?.enter()
        mousemove?.move()

        this.mouse.down(config, keyDef, pointer)
      }
      if (!pointer.isMultitouch) {
        const mousemove = this.mouse.move(config, pointer.position)
        mousemove?.leave()
        mousemove?.enter()
        mousemove?.move()

        this.mouse.up(config, keyDef, pointer)
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

  getMouseTarget(config: Config) {
    return this.mouse.position.target ?? config.document.body
  }

  setMousePosition(position: PointerPosition) {
    this.mouse.position = position
    this.pointers.get('mouse').position = position
  }
}

export function isDifferentPointerPosition(
  positionA: PointerPosition,
  positionB: PointerPosition,
) {
  return (
    positionA.target !== positionB.target ||
    positionA.coords?.x !== positionB.coords?.y ||
    positionA.coords?.y !== positionB.coords?.y ||
    positionA.caret?.node !== positionB.caret?.node ||
    positionA.caret?.offset !== positionB.caret?.offset
  )
}
