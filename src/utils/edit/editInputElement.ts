import {setUIValue, startTrackValue, endTrackValue} from '../../document'
import {dispatchUIEvent} from '../../event'
import {Config} from '../../setup'
import {setSelection} from '../focus/selection'

/**
 * Change the value of an element as if it was changed as a result of a user input.
 *
 * Fires the input event.
 */
export function editInputElement(
  config: Config,
  element: HTMLInputElement | HTMLTextAreaElement,
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
    eventOverrides: InputEventInit
  },
) {
  const oldValue = element.value

  // apply the changes before firing the input event, so that input handlers can access the altered dom and selection
  setUIValue(element, newValue)
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

  dispatchUIEvent(config, element, 'input', eventOverrides)

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
