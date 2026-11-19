export const FOCUSABLE_SELECTOR = [
  'input:not([type=hidden]):not([disabled])',
  'button:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  '[contenteditable="plaintext-only"]',
  'a[href]',
  '[tabindex]:not([disabled])',
  'details > summary',
].join(', ')
