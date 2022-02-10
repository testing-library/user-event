import {TestData, TestDataProps} from './trackProps'
import {eventMapKeys} from '#src/event/eventMap'
import {isElementType, MouseButton} from '#src/utils'

let eventListeners: Array<{
  el: EventTarget
  type: string
  listener: EventListener
}> = []

afterEach(() => {
  for (const {el, type, listener} of eventListeners) {
    el.removeEventListener(type, listener)
  }
  eventListeners = []
  document.body.innerHTML = ''
})

/**
 * Add an event listener that is cleaned up automatically after the test.
 */
export function addEventListener(
  el: EventTarget,
  type: string,
  listener: EventListener,
  options?: AddEventListenerOptions,
) {
  eventListeners.push({el, type, listener})
  el.addEventListener(type, listener, options)
}

export type EventHandlers = {[k in keyof DocumentEventMap]?: EventListener}

/**
 * Add listeners for logging events.
 */
export function addListeners(
  element: Element & {testData?: TestData},
  {
    eventHandlers = {},
  }: {
    eventHandlers?: EventHandlers
  } = {},
) {
  type CallData = {
    event: Event
    elementDisplayName: string
    testData?: TestData
  }
  let eventHandlerCalls: CallData[] = []

  const generalListener = jest.fn(eventHandler).mockName('eventListener')

  for (const eventType of Object.keys(eventMapKeys) as Array<
    keyof typeof eventMapKeys
  >) {
    addEventListener(element, eventType, (...args) => {
      generalListener(...args)
      eventHandlers[eventType]?.(...args)
    })
  }

  addEventListener(element, 'submit', e => e.preventDefault())

  return {
    clearEventCalls,
    eventWasFired,
    getClickEventsSnapshot,
    getEvents,
    getEventSnapshot,
  }

  function eventHandler(event: Event) {
    const target = event.target
    const callData: CallData = {
      event,
      elementDisplayName:
        target && isElement(target) ? getElementDisplayName(target) : '',
    }
    if (element.testData && !element.testData.handled) {
      callData.testData = element.testData
      // sometimes firing a single event (like click on a checkbox) will
      // automatically fire more events (line input and change).
      // and we don't want the test data applied to those, so we'll store
      // this and not add the testData to our call if that was already handled
      element.testData.handled = true
    }
    eventHandlerCalls.push(callData)
  }

  function clearEventCalls() {
    generalListener.mockClear()
    eventHandlerCalls = []
  }

  function eventWasFired(eventType: keyof GlobalEventHandlersEventMap) {
    return getEvents(eventType).length > 0
  }

  function getClickEventsSnapshot() {
    const lines = getEvents().map(e =>
      isMouseEvent(e)
        ? `${e.type} - button=${e.button}; buttons=${e.buttons}; detail=${e.detail}`
        : isPointerEvent(e)
        ? `${e.type} - pointerId=${e.pointerId}; pointerType=${e.pointerType}; isPrimary=${e.isPrimary}`
        : e.type,
    )
    return {snapshot: lines.join('\n')}
  }

  function getEvents<T extends keyof DocumentEventMap>(
    type?: T,
  ): Array<DocumentEventMap[T]> {
    return generalListener.mock.calls
      .map(([e]) => e)
      .filter(e => !type || e.type === type) as Array<DocumentEventMap[T]>
  }

  function getEventSnapshot() {
    const eventCalls = eventHandlerCalls
      .map(({event, testData, elementDisplayName}) => {
        const firstLine = [
          `${elementDisplayName} - ${event.type}`,
          [getEventLabel(event), getEventModifiers(event)]
            .filter(Boolean)
            .join(' '),
        ]
          .filter(Boolean)
          .join(': ')

        return [firstLine, getChanges(testData)].filter(Boolean).join('\n')
      })
      .join('\n')
      .trim()

    if (eventCalls.length) {
      return {
        snapshot: [
          `Events fired on: ${getElementDisplayName(element)}`,
          eventCalls,
        ].join('\n\n'),
      }
    } else {
      return {
        snapshot: `No events were fired on: ${getElementDisplayName(element)}`,
      }
    }
  }
}

function hasProperty<T extends {}, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & {[k in K]: unknown} {
  return prop in obj
}

function isElement(target: EventTarget): target is Element {
  return 'tagName' in target
}

function isMouseEvent(event: Event): event is MouseEvent {
  return (
    event.constructor.name === 'MouseEvent' ||
    event.type === 'click' ||
    event.type.startsWith('mouse')
  )
}

function isKeyboardEvent(event: Event): event is KeyboardEvent {
  return (
    event.constructor.name === 'KeyboardEvent' || event.type.startsWith('key')
  )
}

function isPointerEvent(event: Event): event is PointerEvent {
  return event.type.startsWith('pointer')
}

function getElementDisplayName(element: Element) {
  const displayName = [element.tagName.toLowerCase()]

  if (element.id) {
    displayName.push(`#${element.id}`)
  }
  if (hasProperty(element, 'name') && element.name) {
    displayName.push(`[name="${element.name}"]`)
  }
  if (hasProperty(element, 'htmlFor') && element.htmlFor) {
    displayName.push(`[for="${element.htmlFor}"]`)
  }
  if (
    isElementType(element, 'input') &&
    ['checkbox', 'radio'].includes(element.type)
  ) {
    displayName.push(`[checked=${element.checked}]`)
  } else if (!isElementType(element, 'button')) {
    const v = getElementValue(element)
    if (v) {
      displayName.push(`[value=${v}]`)
    }
  }
  if (isElementType(element, 'option')) {
    displayName.push(`[selected=${element.selected}]`)
  }
  if (element.getAttribute('role') === 'option') {
    displayName.push(`[aria-selected=${element.getAttribute('aria-selected')}]`)
  }

  return displayName.join('')
}

function getElementValue(element: Element) {
  if (isElementType(element, 'select') && element.multiple) {
    return JSON.stringify(Array.from(element.selectedOptions).map(o => o.value))
  } else if (element.getAttribute('role') === 'listbox') {
    return JSON.stringify(
      element.querySelector('[aria-selected="true"]')?.innerHTML,
    )
  } else if (element.getAttribute('role') === 'option') {
    return JSON.stringify(element.innerHTML)
  } else if ('value' in element) {
    return JSON.stringify((element as HTMLInputElement).value)
  }
}

function getEventLabel(event: Event) {
  if (
    isMouseEvent(event) &&
    [
      'click',
      'dblclick',
      'mousedown',
      'mouseup',
      'pointerdown',
      'pointerup',
    ].includes(event.type)
  ) {
    return getMouseButtonName(event.button) ?? `button${event.button}`
  } else if (isKeyboardEvent(event)) {
    return event.key === ' ' ? 'Space' : event.key
  }
}

function getEventModifiers(event: Event) {
  return ['altKey', 'shiftKey', 'metaKey', 'ctrlKey']
    .filter(key => event[key as keyof Event])
    .map(k => `{${k.replace('Key', '')}}`)
    .join(',')
}

function getMouseButtonName(button: number) {
  return Object.keys(MouseButton).find(
    k => MouseButton[k as keyof typeof MouseButton] === button,
  )
}

function getChanges({before, after}: TestData = {}) {
  const changes = new Set()
  if (before && after) {
    for (const key of Object.keys(before) as Array<keyof typeof before>) {
      if (after[key] !== before[key]) {
        if (key === 'checked') {
          changes.add(
            [
              before.checked ? 'checked' : 'unchecked',
              after.checked ? 'checked' : 'unchecked',
            ].join(' -> '),
          )
        } else {
          changes.add(
            [
              JSON.stringify(getValueWithSelection(before)),
              JSON.stringify(getValueWithSelection(after)),
            ].join(' -> '),
          )
        }
      }
    }
  }

  return Array.from(changes)
    .filter(Boolean)
    .map(line => `  ${line}`)
    .join('\n')
}

function getValueWithSelection({
  value,
  selectionStart,
  selectionEnd,
}: TestDataProps = {}) {
  return [
    value?.slice(0, selectionStart ?? undefined),
    ...(selectionStart === selectionEnd
      ? ['{CURSOR}']
      : [
          '{SELECTION}',
          value?.slice(selectionStart ?? 0, selectionEnd ?? undefined),
          '{/SELECTION}',
        ]),
    value?.slice(selectionEnd ?? undefined),
  ].join('')
}
