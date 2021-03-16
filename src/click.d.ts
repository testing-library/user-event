export declare interface clickOptions {
  skipHover?: boolean
  clickCount?: number
}

export declare function click(
  element: TargetElement,
  init?: MouseEventInit,
  options?: clickOptions,
): void
