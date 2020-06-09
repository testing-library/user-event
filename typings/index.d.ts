// Definitions by: Wu Haotian <https://github.com/whtsky>
export interface ITypeOpts {
  allAtOnce?: boolean
  delay?: number
  initialSelectionStart?: number
  initialSelectionEnd?: number
}

export interface ITabUserOptions {
  shift?: boolean
  focusTrap?: Document | Element
}

export type TargetElement = Element | Window

export type FilesArgument = File | File[]

export type UploadInitArgument = {
  clickInit?: MouseEventInit
  changeInit?: Event
}

declare const userEvent: {
  clear: (element: TargetElement) => void
  click: (element: TargetElement, init?: MouseEventInit) => void
  dblClick: (element: TargetElement, init?: MouseEventInit) => void
  selectOptions: (
    element: TargetElement,
    values: string | string[] | HTMLElement | HTMLElement[],
    init?: MouseEventInit,
  ) => void
  toggleSelectOptions: (
    element: TargetElement,
    values: string | string[] | HTMLElement | HTMLElement[],
    init?: MouseEventInit,
  ) => void
  upload: (
    element: TargetElement,
    files: FilesArgument,
    init?: UploadInitArgument,
  ) => void
  type: (
    element: TargetElement,
    text: string,
    userOpts?: ITypeOpts,
  ) => Promise<void>
  tab: (userOpts?: ITabUserOptions) => void
  hover: (element: TargetElement, init?: MouseEventInit) => void
}

export default userEvent
