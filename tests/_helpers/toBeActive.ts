// .toHaveFocus() by `jest-dom` does not consider shadow DOM
// https://github.com/testing-library/jest-dom/blob/948d90f32cc79339bdeebea0454599db74c5d071/src/to-have-focus.js

import {getActiveElementOrBody} from '#src/utils'

export function toBeActive(
  this: jest.MatcherContext,
  element: Element,
): jest.CustomMatcherResult {
  const active = getActiveElementOrBody(element.ownerDocument)

  return {
    pass: active === element,
    message: () =>
      [
        this.utils.matcherHint(
          `${this.isNot ? '.not' : ''}.toBeActive`,
          'element',
          '',
        ),
        '',
        ...(this.isNot
          ? [
              'Received element is focused:',
              `  ${this.utils.printReceived(element)}`,
            ]
          : [
              'Expected element with focus:',
              `  ${this.utils.printExpected(element)}`,
              'Received element with focus:',
              `  ${this.utils.printReceived(active)}`,
            ]),
      ].join('\n'),
  }
}
