import {fireEvent} from '@testing-library/dom'
import {
  isContentEditable,
} from '../../utils'
import {setSelectionRange} from './setSelectionRange'

export function fireInputEvent(
  element: HTMLElement,
  {
    newValue,
    newSelectionStart,
    eventOverrides,
  }: {
    newValue: string
    newSelectionStart: number
    eventOverrides: Partial<Parameters<typeof fireEvent>[1]> & {
      [k: string]: unknown
    }
  },
) {
  fireEvent.input(element, {
    target: {
      [isContentEditable(element) ? 'textContent': 'value']: newValue
    },
    ...eventOverrides,
  })

  setSelectionRange({
    currentElement: () => element,
    newValue,
    newSelectionStart,
  })
}
