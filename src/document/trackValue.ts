import {getWindow} from '../utils'
import {hasUISelection, setUISelection, setUIValueClean} from './UI'

const TrackChanges = Symbol('Track programmatic changes for React workaround')

declare global {
  interface Window {
    REACT_VERSION?: number
  }
  interface Element {
    [TrackChanges]?: {
      previousValue?: string
      tracked?: string[]
      nextValue?: string
    }
  }
}

// When the input event happens in the browser, React executes all event handlers
// and if they change state of a controlled value, nothing happens.
// But when we trigger the event handlers in test environment with React@17,
// the changes are rolled back before the state update is applied.
// This results in a reset cursor.
// There might be a better way to work around if we figure out
// why the batched update is executed differently in our test environment.

function isReact17Element(element: Element) {
  return (
    Object.getOwnPropertyNames(element).some(k => k.startsWith('__react')) &&
    getWindow(element).REACT_VERSION === 17
  )
}

export function startTrackValue(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  if (!isReact17Element(element)) {
    return
  }

  element[TrackChanges] = {
    previousValue: String(element.value),
    tracked: [],
  }
}

export function trackOrSetValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  v: string,
) {
  element[TrackChanges]?.tracked?.push(v)

  if (!element[TrackChanges]) {
    setUIValueClean(element)
    setUISelection(element, {focusOffset: v.length})
  }
}

export function commitValueAfterInput(
  element: HTMLInputElement | HTMLTextAreaElement,
  cursorOffset: number,
) {
  const changes = element[TrackChanges]

  element[TrackChanges] = undefined

  if (!changes?.tracked?.length) {
    return
  }

  const isJustReactStateUpdate =
    changes.tracked.length === 2 &&
    changes.tracked[0] === changes.previousValue &&
    changes.tracked[1] === element.value

  if (!isJustReactStateUpdate) {
    setUIValueClean(element)
  }

  if (hasUISelection(element)) {
    setUISelection(element, {
      focusOffset: isJustReactStateUpdate ? cursorOffset : element.value.length,
    })
  }
}
