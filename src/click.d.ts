export declare interface clickOptions {
  skipHover?: boolean
  clickCount?: number
}

export declare function click(
  element: Element,
  init?: MouseEventInit,
  options?: clickOptions,
): void

export declare function dblClick(element: Element, init?: MouseEventInit): void
