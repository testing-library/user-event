interface uploadInit {
  clickInit?: MouseEventInit
  changeInit?: Event
}

interface uploadOptions {
  applyAccept?: boolean
}

export declare function upload(
  element: Element,
  files: File | File[],
  init?: uploadInit,
  options?: uploadOptions,
): void
