// Definitions by: Wu Haotian <https://github.com/whtsky>
export interface ITypeOpts {
  skipClick?: boolean
  skipAutoClose?: boolean
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

export interface IClickOptions {
  skipHover?: boolean
  clickCount?: number
}

declare const userEvent: {
  clear: (element: TargetElement) => void
  click: (
    element: TargetElement,
    init?: MouseEventInit,
    options?: IClickOptions,
  ) => void
  dblClick: (
    element: TargetElement,
    init?: MouseEventInit,
    options?: IClickOptions,
  ) => void
  selectOptions: (
    element: TargetElement,
    values: string | string[] | HTMLElement | HTMLElement[],
    init?: MouseEventInit,
  ) => void
  deselectOptions: (
    element: TargetElement,
    values: string | string[] | HTMLElement | HTMLElement[],
    init?: MouseEventInit,
  ) => void
  upload: (
    element: TargetElement,
    files: FilesArgument,
    init?: UploadInitArgument,
  ) => void
  type: <T extends ITypeOpts>(
    element: TargetElement,
    text: string,
    userOpts?: T,
  ) => T extends {delay: number} ? Promise<void> : void
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
