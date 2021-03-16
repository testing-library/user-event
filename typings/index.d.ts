import type {click, clickOptions} from '../src/click'
import type {
  keyboard,
  keyboardOptions,
  specialCharMap,
  keyboardKey,
} from '../src/keyboard'
import type {type, typeOptions} from '../src/type'

// Definitions by: Wu Haotian <https://github.com/whtsky>
export interface ITabUserOptions {
  shift?: boolean
  focusTrap?: Document | Element
}

export type TargetElement = Element

export type FilesArgument = File | File[]

export type UploadInitArgument = {
  clickInit?: MouseEventInit
  changeInit?: Event
}

export interface IUploadOptions {
  applyAccept?: boolean
}

declare const userEvent: {
  clear: (element: TargetElement) => void
  click: typeof click
  dblClick: (
    element: TargetElement,
    init?: MouseEventInit,
    options?: IClickOptions,
  ) => void
  selectOptions: (
    element: TargetElement,
    values: HTMLElement | HTMLElement[] | string[] | string,
    init?: MouseEventInit,
  ) => void
  deselectOptions: (
    element: TargetElement,
    values: HTMLElement | HTMLElement[] | string[] | string,
    init?: MouseEventInit,
  ) => void
  upload: (
    element: TargetElement,
    files: FilesArgument,
    init?: UploadInitArgument,
    options?: IUploadOptions,
  ) => void
  type: typeof type
  keyboard: typeof keyboard
  tab: (userOpts?: ITabUserOptions) => void
  paste: (
    element: TargetElement,
    text: string,
    init?: MouseEventInit,
    pasteOptions?: {
      initialSelectionStart?: number
      initialSelectionEnd?: number
    },
  ) => void
  hover: (element: TargetElement, init?: MouseEventInit) => void
  unhover: (element: TargetElement, init?: MouseEventInit) => void
}

export default userEvent

export {keyboardOptions, keyboardKey, specialCharMap as specialChars}
export {typeOptions, typeOptions as ITypeOpts}
export {clickOptions, clickOptions as IClickOptions}
