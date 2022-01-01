/**
 * This file should contain behavior for arrow keys as described here:
 * https://w3c.github.io/uievents-code/#key-arrowpad-section
 */

import {behaviorPlugin} from '../types'
import {getNextCursorPosition, hasOwnSelection, setSelection} from '../../utils'
import {getUISelection} from '../../document'

export const keydownBehavior: behaviorPlugin[] = [
  {
    matches: keyDef =>
      keyDef.key === 'ArrowLeft' || keyDef.key === 'ArrowRight',
    handle: (keyDef, element) => {
      // TODO: implement shift

      if (hasOwnSelection(element)) {
        const selection = getUISelection(element as HTMLInputElement)

        setSelection({
          focusNode: element,
          focusOffset:
            selection.startOffset === selection.endOffset
              ? selection.focusOffset + (keyDef.key === 'ArrowLeft' ? -1 : 1)
              : keyDef.key === 'ArrowLeft'
              ? selection.startOffset
              : selection.endOffset,
        })
      } else {
        const selection = element.ownerDocument.getSelection()

        /* istanbul ignore if */
        if (!selection) {
          return
        }

        if (selection.isCollapsed) {
          const nextPosition = getNextCursorPosition(
            selection.focusNode as Node,
            selection.focusOffset,
            keyDef.key === 'ArrowLeft' ? -1 : 1,
          )
          if (nextPosition) {
            setSelection({
              focusNode: nextPosition.node,
              focusOffset: nextPosition.offset,
            })
          }
        } else {
          selection[
            keyDef.key === 'ArrowLeft' ? 'collapseToStart' : 'collapseToEnd'
          ]()
        }
      }
    },
  },
]
