import {blur, cloneEvent, focus, isElementType, isFocusable} from '../../utils'
import {dispatchEvent} from '../dispatchEvent'
import {behavior} from './registry'

behavior.click = (event, target, config) => {
  const control = target.closest('label')?.control
  if (control) {
    return () => {
      if (isFocusable(control)) {
        focus(control)
      }
      dispatchEvent(config, control, cloneEvent(event))
    }
  } else if (isElementType(target, 'input', {type: 'file'})) {
    return () => {
      // blur fires when the file selector pops up
      blur(target)

      target.dispatchEvent(new Event('fileDialog'))

      // focus fires after the file selector has been closed
      focus(target)
    }
  }
}
