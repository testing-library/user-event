/**
 * @deprecated This list of strings with special meaning is no longer necessary
 * as we've introduced a standardized way to describe any keystroke for `userEvent`.
 * @see https://testing-library.com/docs/ecosystem-user-event#keyboardtext-options
 */
export const specialCharMap = {
  arrowLeft: '{arrowleft}',
  arrowRight: '{arrowright}',
  arrowDown: '{arrowdown}',
  arrowUp: '{arrowup}',
  enter: '{enter}',
  escape: '{esc}',
  delete: '{del}',
  backspace: '{backspace}',
  home: '{home}',
  end: '{end}',
  selectAll: '{selectall}',
  space: '{space}',
  whitespace: ' ',
  pageUp: '{pageUp}',
  pageDown: '{pageDown}',
} as const
