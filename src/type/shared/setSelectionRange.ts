import {getValue, setSelectionRangeIfNecessary} from '../../utils/edit'

export function setSelectionRange({
  currentElement,
  newValue,
  newSelectionStart,
}: {
  currentElement: () => Element | null
  newValue: string
  newSelectionStart: number
}): void {
  // if we *can* change the selection start, then we will if the new value
  // is the same as the current value (so it wasn't programatically changed
  // when the fireEvent.input was triggered).
  // The reason we have to do this at all is because it actually *is*
  // programmatically changed by fireEvent.input, so we have to simulate the
  // browser's default behavior
  const el = currentElement() as Element

  const value = getValue(el) as string

  if (value === newValue) {
    setSelectionRangeIfNecessary(el, newSelectionStart, newSelectionStart)
  } else {
    // If the currentValue is different than the expected newValue and we *can*
    // change the selection range, than we should set it to the length of the
    // currentValue to ensure that the browser behavior is mimicked.
    setSelectionRangeIfNecessary(el, value.length, value.length)
  }
}
