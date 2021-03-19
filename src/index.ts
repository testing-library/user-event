import {click, dblClick} from './click'
import {type} from './type'
import {clear} from './clear'
import {tab} from './tab'
import {hover, unhover} from './hover'
import {upload} from './upload'
import {selectOptions, deselectOptions} from './select-options'
import {paste} from './paste'
import {keyboard, specialCharMap} from './keyboard'

const userEvent = {
  click,
  dblClick,
  type,
  clear,
  tab,
  hover,
  unhover,
  upload,
  selectOptions,
  deselectOptions,
  paste,
  keyboard,
}

export default userEvent

export {specialCharMap as specialChars}
export type {keyboardKey} from './keyboard'
