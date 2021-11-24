import {click, dblClick, tripleClick, hover, unhover, tab} from '../convenience'
import {keyboard} from '../keyboard'
import {copy, cut, paste} from '../clipboard'
import {pointer} from '../pointer'
import {clear, deselectOptions, selectOptions, type, upload} from '../utility'

export const userEventApi = {
  clear,
  click,
  copy,
  cut,
  dblClick,
  deselectOptions,
  hover,
  keyboard,
  paste,
  pointer,
  selectOptions,
  tab,
  tripleClick,
  type,
  unhover,
  upload,
} as const
