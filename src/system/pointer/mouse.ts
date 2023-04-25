import {
  EventType,
  focusElement,
  modifySelectionPerMouseMove,
  SelectionRange,
  setSelectionPerMouseDown,
} from '../../event'
import {type Instance} from '../../setup'
import {getTreeDiff, isDisabled} from '../../utils'
import {Buttons, getMouseEventButton, MouseButton} from './buttons'
import {type Pointer} from './pointer'
import {isDifferentPointerPosition, pointerKey, PointerPosition} from './shared'

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

  move(instance: Instance, position: PointerPosition, pointer: Pointer) {
    if (pointer.isPrevented) {
      return
    }
    const prevPosition = this.position
    const prevTarget = this.getTarget(instance)

    this.position = position

    if (!isDifferentPointerPosition(prevPosition, position)) {
      return
    }

    const nextTarget = this.getTarget(instance)

    const init = this.getEventInit('mousemove')

    const [leave, enter] = getTreeDiff(prevTarget, nextTarget)

    return {
      leave: () => {
        if (prevTarget !== nextTarget) {
          instance.dispatchUIEvent(prevTarget, 'mouseout', init)
          leave.forEach(el => instance.dispatchUIEvent(el, 'mouseleave', init))
        }
      },
      enter: () => {
        if (prevTarget !== nextTarget) {
          instance.dispatchUIEvent(nextTarget, 'mouseover', init)
          enter.forEach(el => instance.dispatchUIEvent(el, 'mouseenter', init))
        }
      },
      move: () => {
        instance.dispatchUIEvent(nextTarget, 'mousemove', init)

        this.modifySelecting(instance)
      },
    }
  }

  down(instance: Instance, keyDef: pointerKey, pointer: Pointer) {
    const button = this.buttons.down(keyDef)

    if (button === undefined) {
      return
    }

    const target = this.getTarget(instance)
    this.buttonDownTarget[button] = target
    const init = this.getEventInit('mousedown', keyDef.button)
    if (pointer.isPrevented) {
      return
    }
    const disabled = isDisabled(target)
    if (disabled || instance.dispatchUIEvent(target, 'mousedown', init)) {
      this.startSelecting(instance, init.detail as number)
      focusElement(target)
    }
    if (!disabled && getMouseEventButton(keyDef.button) === 2) {
      instance.dispatchUIEvent(
          target,
          'contextmenu',
          this.getEventInit('contextmenu', keyDef.button, pointer),
      )
    }
  }

  up(instance: Instance, keyDef: pointerKey, pointer: Pointer) {
    const button = this.buttons.up(keyDef)

    if (button === undefined) {
      return
    }
    const target = this.getTarget(instance)
    if (!isDisabled(target)) {
      const init = this.getEventInit('mouseup', keyDef.button)
      if (!pointer.isPrevented) {
        instance.dispatchUIEvent(
            target,
            'mouseup',
            init,
        )
        this.endSelecting()
      }

      const clickTarget = getTreeDiff(
          this.buttonDownTarget[button],
          target,
      )[2][0] as Element | undefined
      if (clickTarget) {
        const init = this.getEventInit('click', keyDef.button, pointer)
        if (init.detail) {
          instance.dispatchUIEvent(
              clickTarget,
              init.button === 0 ? 'click' : 'auxclick',
              init,
          )
          if (init.button === 0 && init.detail === 2) {
            instance.dispatchUIEvent(clickTarget, 'dblclick', {
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

  private getTarget(instance: Instance) {
    return this.position.target ?? instance.config.document.body
  }

  private startSelecting(instance: Instance, clickCount: number) {
    // TODO: support extending range (shift)

    this.selecting = setSelectionPerMouseDown({
      document: instance.config.document,
      target: this.getTarget(instance),
      node: this.position.caret?.node,
      offset: this.position.caret?.offset,
      clickCount,
    })
  }

  private modifySelecting(instance: Instance) {
    if (!this.selecting) {
      return
    }
    modifySelectionPerMouseMove(this.selecting, {
      document: instance.config.document,
      target: this.getTarget(instance),
      node: this.position.caret?.node,
      offset: this.position.caret?.offset,
    })
  }

  private endSelecting() {
    this.selecting = undefined
  }
}
