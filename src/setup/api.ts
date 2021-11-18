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

/** Which is the options parameter? */
export const userEventApiOptionsParameter = {
  clear: undefined,
  click: 1,
  copy: 0,
  cut: 0,
  dblClick: 1,
  deselectOptions: 2,
  hover: 1,
  keyboard: 1,
  paste: 1,
  pointer: 1,
  selectOptions: 2,
  tab: 0,
  tripleClick: 1,
  type: 2,
  unhover: 1,
  upload: 3,
} as const
