import {dispatchUIEvent} from '../../event'
import {Config} from '../../setup'
import {assertPointerEvents, getTreeDiff, hasPointerEvents} from '../../utils'
import {isDifferentPointerPosition, pointerKey, PointerPosition} from '.'

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

  init(config: Config, position: PointerPosition) {
    this.position = position

    const target = this.getTarget(config)
    const [, enter] = getTreeDiff(null, target)
    const init = this.getEventInit()

    assertPointerEvents(config, target)

    dispatchUIEvent(config, target, 'pointerover', init)
    enter.forEach(el => dispatchUIEvent(config, el, 'pointerenter', init))

    return this
  }

  move(config: Config, position: PointerPosition) {
    const prevPosition = this.position
    const prevTarget = this.getTarget(config)

    this.position = position

    if (!isDifferentPointerPosition(prevPosition, position)) {
      return
    }

    const nextTarget = this.getTarget(config)

    const init = this.getEventInit()

    const [leave, enter] = getTreeDiff(prevTarget, nextTarget)

    return {
      leave: () => {
        if (hasPointerEvents(config, prevTarget)) {
          if (prevTarget !== nextTarget) {
            dispatchUIEvent(config, prevTarget, 'pointerout', init)
            leave.forEach(el =>
              dispatchUIEvent(config, el, 'pointerleave', init),
            )
          }
        }
      },
      enter: () => {
        assertPointerEvents(config, nextTarget)

        if (prevTarget !== nextTarget) {
          dispatchUIEvent(config, nextTarget, 'pointerover', init)
          enter.forEach(el => dispatchUIEvent(config, el, 'pointerenter', init))
        }
      },
      move: () => {
        dispatchUIEvent(config, nextTarget, 'pointermove', init)
      },
    }
  }

  down(config: Config, _keyDef: pointerKey) {
    if (this.isDown) {
      return
    }
    const target = this.getTarget(config)

    assertPointerEvents(config, target)

    this.isDown = true
    this.isPrevented = !dispatchUIEvent(
      config,
      target,
      'pointerdown',
      this.getEventInit(),
    )
  }

  up(config: Config, _keyDef: pointerKey) {
    if (!this.isDown) {
      return
    }
    const target = this.getTarget(config)

    assertPointerEvents(config, target)

    this.isDown = false
    dispatchUIEvent(config, target, 'pointerup', this.getEventInit())
  }

  release(config: Config) {
    const target = this.getTarget(config)
    const [leave] = getTreeDiff(target, null)
    const init = this.getEventInit()

    // Currently there is no PointerEventsCheckLevel that would
    // make this check not use the *asserted* cached value from `up`.
    /* istanbul ignore else */
    if (hasPointerEvents(config, target)) {
      dispatchUIEvent(config, target, 'pointerout', init)
      leave.forEach(el => dispatchUIEvent(config, el, 'pointerleave', init))
    }

    this.isCancelled = true
  }

  private getTarget(config: Config) {
    return this.position.target ?? config.document.body
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
