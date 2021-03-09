import {specialCharMap} from '../specialCharMap'
import {handleArrowDown} from './handleArrowDown'
import {handleArrowUp} from './handleArrowUp'
import {handleBackspace} from './handleBackspace'
import {handleDel} from './handleDel'
import {handleEnter} from './handleEnter'
import {handleEsc} from './handleEsc'
import {handleSelectall} from './handleSelectall'
import {handleSpace} from './handleSpace'
import {navigationKey} from './navigationKey'

export const specialCharCallbackMap = {
  [specialCharMap.arrowLeft]: navigationKey('ArrowLeft'),
  [specialCharMap.arrowRight]: navigationKey('ArrowRight'),
  [specialCharMap.arrowDown]: handleArrowDown,
  [specialCharMap.arrowUp]: handleArrowUp,
  [specialCharMap.home]: navigationKey('Home'),
  [specialCharMap.end]: navigationKey('End'),
  [specialCharMap.enter]: handleEnter,
  [specialCharMap.escape]: handleEsc,
  [specialCharMap.delete]: handleDel,
  [specialCharMap.backspace]: handleBackspace,
  [specialCharMap.selectAll]: handleSelectall,
  [specialCharMap.space]: handleSpace,
  [specialCharMap.whitespace]: handleSpace,
}
