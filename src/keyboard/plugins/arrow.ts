/**
 * This file should contain behavior for arrow keys as described here:
 * https://w3c.github.io/uievents-code/#key-arrowpad-section
 */

import {behaviorPlugin} from '../types'
import {isElementType, setSelection} from '../../utils'
import {getUISelection} from '../../document'

export const keydownBehavior: behaviorPlugin[] = [
  {
    // TODO: implement for contentEditable
    matches: (keyDef, element) =>
      (keyDef.key === 'ArrowLeft' || keyDef.key === 'ArrowRight') &&
      isElementType(element, ['input', 'textarea']),
    handle: (keyDef, element) => {
      const selection = getUISelection(element as HTMLInputElement)

      // TODO: implement shift/ctrl
      setSelection({
        focusNode: element,
        focusOffset:
          selection.startOffset === selection.endOffset
            ? selection.focusOffset + (keyDef.key === 'ArrowLeft' ? -1 : 1)
            : keyDef.key === 'ArrowLeft'
            ? selection.startOffset
            : selection.endOffset,
      })
    },
  },
]
