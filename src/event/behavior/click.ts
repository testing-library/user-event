import {cloneEvent, getWindow, isElementType, isFocusable} from '../../utils'
import {blurElement, focusElement} from '../focus'
import {behavior} from './registry'

behavior.click = (event, target, instance) => {
  const context = target.closest('button,input,label,select,textarea')
  const control = context && isElementType(context, 'label') && context.control
  if (control) {
    return () => {
      if (isFocusable(control)) {
        focusElement(control)
      }
      instance.dispatchEvent(control, cloneEvent(event))
    }
  } else if (isElementType(target, 'input', {type: 'file'})) {
    return () => {
      // blur fires when the file selector pops up
      blurElement(target)

      target.dispatchEvent(new (getWindow(target).Event)('fileDialog'))

      // focus fires after the file selector has been closed
      focusElement(target)
    }
  }
}
