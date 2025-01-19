import {type Instance} from '../../setup'
import {assertPointerEvents, getTreeDiff, hasPointerEvents} from '../../utils'
import {isDifferentPointerPosition, pointerKey, PointerPosition} from './shared'

type PointerInit = {
  pointerId: number
  pointerType: string
  isPrimary: boolean
}

export class Pointer {
  constructor({pointerId, pointerType, isPrimary}: PointerInit) {
    this.pointerId = pointerId
    this.pointerType = pointerType
    this.isPrimary = isPrimary
    this.isMultitouch = !isPrimary
  }
  readonly pointerId: number
  readonly pointerType: string
  readonly isPrimary: boolean

  isMultitouch: boolean = false
  isCancelled: boolean = false
  isDown: boolean = false
  isPrevented: boolean = false

  position: PointerPosition = {}

  init(instance: Instance, position: PointerPosition) {
    this.position = position

    const target = this.getTarget(instance)
    const [, enter] = getTreeDiff(null, target)
    const init = this.getEventInit()

    assertPointerEvents(instance, target)

    instance.dispatchUIEvent(target, 'pointerover', init)
    enter.forEach(el => instance.dispatchUIEvent(el, 'pointerenter', init))

    return this
  }

  move(instance: Instance, position: PointerPosition) {
    const prevPosition = this.position
    const prevTarget = this.getTarget(instance)

    this.position = position

    if (!isDifferentPointerPosition(prevPosition, position)) {
      return
    }

    const nextTarget = this.getTarget(instance)

    const init = this.getEventInit()

    const [leave, enter] = getTreeDiff(prevTarget, nextTarget)

    return {
      leave: () => {
        if (hasPointerEvents(instance, prevTarget)) {
          if (prevTarget !== nextTarget) {
            instance.dispatchUIEvent(prevTarget, 'pointerout', init)
            leave.forEach(el =>
              instance.dispatchUIEvent(el, 'pointerleave', init),
            )
          }
        }
      },
      enter: () => {
        assertPointerEvents(instance, nextTarget)

        if (prevTarget !== nextTarget) {
          instance.dispatchUIEvent(nextTarget, 'pointerover', init)
          enter.forEach(el =>
            instance.dispatchUIEvent(el, 'pointerenter', init),
          )
        }
      },
      move: () => {
        instance.dispatchUIEvent(nextTarget, 'pointermove', init)
      },
    }
  }

  down(instance: Instance, _keyDef: pointerKey) {
    if (this.isDown) {
      return
    }
    const target = this.getTarget(instance)

    assertPointerEvents(instance, target)

    this.isDown = true
    this.isPrevented = !instance.dispatchUIEvent(
      target,
      'pointerdown',
      this.getEventInit(),
    )
  }

  up(instance: Instance, _keyDef: pointerKey) {
    if (!this.isDown) {
      return
    }
    const target = this.getTarget(instance)

    assertPointerEvents(instance, target)

    this.isPrevented = false
    this.isDown = false
    instance.dispatchUIEvent(target, 'pointerup', this.getEventInit())
  }

  release(instance: Instance) {
    const target = this.getTarget(instance)
    const [leave] = getTreeDiff(target, null)
    const init = this.getEventInit()

    // Currently there is no PointerEventsCheckLevel that would
    // make this check not use the *asserted* cached value from `up`.
    /* istanbul ignore else */
    if (hasPointerEvents(instance, target)) {
      instance.dispatchUIEvent(target, 'pointerout', init)
      leave.forEach(el => instance.dispatchUIEvent(el, 'pointerleave', init))
    }

    this.isCancelled = true
  }

  private getTarget(instance: Instance) {
    return this.position.target ?? instance.config.document.body
  }

  private getEventInit(): PointerEventInit {
    return {
      ...this.position.coords,
      pointerId: this.pointerId,
      pointerType: this.pointerType,
      isPrimary: this.isPrimary,
    }
  }
}
