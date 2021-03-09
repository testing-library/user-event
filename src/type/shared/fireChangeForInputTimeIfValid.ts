import {fireEvent} from '@testing-library/dom'
import {isValidInputTimeValue} from '../../utils/edit'

export function fireChangeForInputTimeIfValid(
  currentElement: () => Element | null,
  prevValue: unknown,
  timeNewEntry: string,
) {
  const el = currentElement()
  if (
    el &&
    isValidInputTimeValue(el, timeNewEntry) &&
    prevValue !== timeNewEntry
  ) {
    fireEvent.change(el, {target: {value: timeNewEntry}})
  }
}
