import type {keyboardKey} from './keyboard/types'
import type {pointerKey} from './pointer/types'

export interface Options {
  applyAccept?: boolean
  autoModify?: boolean
  delay?: number | null
  document?: Document
  keyboardMap?: keyboardKey[]
  pointerMap?: pointerKey[]
  skipAutoClose?: boolean
  skipClick?: boolean
  skipHover?: boolean
  skipPointerEventsCheck?: boolean
  writeToClipboard?: boolean
}
