import {fireEvent} from '@testing-library/dom'
import {setUIValue, startTrackValue, endTrackValue} from '../../document'
import {isElementType} from '../misc/isElementType'
import {setSelection} from '../focus/selection'

export function fireInputEvent(
  element: HTMLElement,
  {
    newValue,
    newSelection,
    eventOverrides,
  }: {
    newValue: string
    newSelection: {
      node: Node
      offset: number
    }
    eventOverrides: Partial<Parameters<typeof fireEvent>[1]> & {
      [k: string]: unknown
    }
  },
) {
  const oldValue = (element as HTMLInputElement).value

  // apply the changes before firing the input event, so that input handlers can access the altered dom and selection
  if (isElementType(element, ['input', 'textarea'])) {
    setUIValue(element, newValue)
  } else {
    // The pre-commit hooks keeps changing this
    // See https://github.com/kentcdodds/kcd-scripts/issues/218
    /* istanbul ignore else */
    // eslint-disable-next-line no-lonely-if
    if (newSelection.node.nodeType === 3) {
      newSelection.node.textContent = newValue
    } else {
      // TODO: properly type guard
      throw new Error('Invalid Element')
    }
  }
  setSelection({
    focusNode: newSelection.node,
    anchorOffset: newSelection.offset,
    focusOffset: newSelection.offset,
  })

  // When the input event happens in the browser, React executes all event handlers
  // and if they change state of a controlled value, nothing happens.
  // But when we trigger the event handlers in test environment,
  // the changes are rolled back by React before the state update is applied.
  // Then the updated state is applied which results in a resetted cursor.
  // There is probably a better way to work around  if we figure out
  // why the batched update is executed differently in our test environment.
  startTrackValue(element as HTMLInputElement)

  fireEvent.input(element, {
    ...eventOverrides,
  })

  const tracked = endTrackValue(element as HTMLInputElement)
  if (
    tracked?.length === 2 &&
    tracked[0] === oldValue &&
    tracked[1] === newValue
  ) {
    setSelection({
      focusNode: newSelection.node,
      anchorOffset: newSelection.offset,
      focusOffset: newSelection.offset,
    })
  }
}
