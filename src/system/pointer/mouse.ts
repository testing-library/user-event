import {dispatchUIEvent, EventType} from '../../event'
import {Config} from '../../setup'
import {
  focus,
  getTreeDiff,
  isDisabled,
  modifySelectionPerMouseMove,
  SelectionRange,
  setSelectionPerMouseDown,
} from '../../utils'
import {isDifferentPointerPosition, pointerKey, PointerPosition} from '.'
import {Buttons, getMouseEventButton, MouseButton} from './buttons'
import type {Pointer} from './pointer'

/**
 * This object is the single "virtual" mouse that might be controlled by multiple different pointer devices.
 */
export class Mouse {
  position: PointerPosition = {}
  private readonly buttons = new Buttons()
  private selecting?: Range | SelectionRange
  private buttonDownTarget = {} as Record<number, Element>

  // According to spec the `detail` on click events should be the number
  // of *consecutive* clicks with a specific button.
  // On `mousedown` and `mouseup` it should be this number increased by one.
  // But the browsers don't implement it this way.
  // If another button is pressed,
  //   in Webkit: the `mouseup` on the previously pressed button has `detail: 0` and no `click`/`auxclick`.
  //   in Gecko: the `mouseup` and click events have the same detail as the `mousedown`.
  // If there is a delay while a button is pressed,
  // the `mouseup` and `click` are normal, but a following `mousedown` starts a new click count.
  // We'll follow the minimal implementation of Webkit.
  private readonly clickCount = new (class {
    private down: Record<number, number | undefined> = {}
    private count: Record<number, number | undefined> = {}

    incOnClick(button: number) {
      const current =
        this.down[button] === undefined
          ? undefined
          : Number(this.down[button]) + 1

      this.count =
        this.count[button] === undefined
          ? {}
          : {[button]: Number(this.count[button]) + 1}

      return current
    }

    getOnDown(button: number) {
      this.down = {[button]: this.count[button] ?? 0}
      this.count = {[button]: this.count[button] ?? 0}

      return Number(this.count[button]) + 1
    }

    getOnUp(button: number) {
      return this.down[button] === undefined
        ? undefined
        : Number(this.down[button]) + 1
    }

    reset() {
      this.count = {}
    }
  })()

  move(config: Config, position: PointerPosition) {
    const prevPosition = this.position
    const prevTarget = this.getTarget(config)

    this.position = position

    if (!isDifferentPointerPosition(prevPosition, position)) {
      return
    }

    const nextTarget = this.getTarget(config)

    const init = this.getEventInit('mousemove')

    const [leave, enter] = getTreeDiff(prevTarget, nextTarget)

    return {
      leave: () => {
        if (prevTarget !== nextTarget) {
          dispatchUIEvent(config, prevTarget, 'mouseout', init)
          leave.forEach(el => dispatchUIEvent(config, el, 'mouseleave', init))
        }
      },
      enter: () => {
        if (prevTarget !== nextTarget) {
          dispatchUIEvent(config, nextTarget, 'mouseover', init)
          enter.forEach(el => dispatchUIEvent(config, el, 'mouseenter', init))
        }
      },
      move: () => {
        dispatchUIEvent(config, nextTarget, 'mousemove', init)

        this.modifySelecting(config)
      },
    }
  }

  down(config: Config, keyDef: pointerKey, pointer: Pointer) {
    const button = this.buttons.down(keyDef)

    if (button === undefined) {
      return
    }

    const target = this.getTarget(config)
    this.buttonDownTarget[button] = target
    const disabled = isDisabled(target)
    const init = this.getEventInit('mousedown', keyDef.button)
    if (disabled || dispatchUIEvent(config, target, 'mousedown', init)) {
      this.startSelecting(config, init.detail as number)
      focus(target)
    }
    if (!disabled && getMouseEventButton(keyDef.button) === 2) {
      dispatchUIEvent(
        config,
        target,
        'contextmenu',
        this.getEventInit('contextmenu', keyDef.button, pointer),
      )
    }
  }

  up(config: Config, keyDef: pointerKey, pointer: Pointer) {
    const button = this.buttons.up(keyDef)

    if (button === undefined) {
      return
    }
    const target = this.getTarget(config)
    if (!isDisabled(target)) {
      dispatchUIEvent(
        config,
        target,
        'mouseup',
        this.getEventInit('mouseup', keyDef.button),
      )
      this.endSelecting()

      const clickTarget = getTreeDiff(
        this.buttonDownTarget[button],
        target,
      )[2][0] as Element | undefined
      if (clickTarget) {
        const init = this.getEventInit('click', keyDef.button, pointer)
        if (init.detail) {
          dispatchUIEvent(
            config,
            clickTarget,
            init.button === 0 ? 'click' : 'auxclick',
            init,
          )
          if (init.button === 0 && init.detail === 2) {
            dispatchUIEvent(config, clickTarget, 'dblclick', {
              ...this.getEventInit('dblclick', keyDef.button),
              detail: init.detail,
            })
          }
        }
      }
    }
  }

  resetClickCount() {
    this.clickCount.reset()
  }

  private getEventInit(
    type: EventType,
    button?: MouseButton,
    pointer?: Pointer,
  ) {
    const init: PointerEventInit = {
      ...this.position.coords,
    }

    if (pointer) {
      init.pointerId = pointer.pointerId
      init.pointerType = pointer.pointerType
      init.isPrimary = pointer.isPrimary
    }

    init.button = getMouseEventButton(button)
    init.buttons = this.buttons.getButtons()

    if (type === 'mousedown') {
      init.detail = this.clickCount.getOnDown(init.button)
    } else if (type === 'mouseup') {
      init.detail = this.clickCount.getOnUp(init.button)
    } else if (type === 'click' || type === 'auxclick') {
      init.detail = this.clickCount.incOnClick(init.button)
    }

    return init
  }

  private getTarget(config: Config) {
    return this.position.target ?? config.document.body
  }

  private startSelecting(config: Config, clickCount: number) {
    // TODO: support extending range (shift)

    this.selecting = setSelectionPerMouseDown({
      document: config.document,
      target: this.getTarget(config),
      node: this.position.caret?.node,
      offset: this.position.caret?.offset,
      clickCount,
    })
  }

  private modifySelecting(config: Config) {
    if (!this.selecting) {
      return
    }
    modifySelectionPerMouseMove(this.selecting, {
      document: config.document,
      target: this.getTarget(config),
      node: this.position.caret?.node,
      offset: this.position.caret?.offset,
    })
  }

  private endSelecting() {
    this.selecting = undefined
  }
}
