/* eslint-disable testing-library/no-node-access */
import {eventMap} from '@testing-library/dom/dist/event-map'
import {isElementType} from '#src/utils'
// this is pretty helpful:
// https://codesandbox.io/s/quizzical-worker-eo909

// all of the stuff below is complex magic that makes the simpler tests work
// sorrynotsorry...

const unstringSnapshotSerializer: jest.SnapshotSerializerPlugin = {
  test: (val: unknown) =>
    Boolean(
      typeof val === 'object'
        ? Object.prototype.hasOwnProperty.call(val, 'snapshot')
        : false,
    ),
  print: val => String((<null | {snapshot?: string}>val)?.snapshot),
}

expect.addSnapshotSerializer(unstringSnapshotSerializer)

type EventHandlers = Record<string, EventListener>

// The HTMLCollection in lib.d.ts does not allow array access
type HTMLCollection<Elements extends Array<Element>> = Elements & {
  item<N extends number>(i: N): Elements[N]
}

function setup<Elements extends Element | Element[] = HTMLElement>(
  ui: string,
  {
    eventHandlers,
  }: {
    eventHandlers?: EventHandlers
  } = {},
) {
  const div = document.createElement('div')
  div.innerHTML = ui.trim()
  document.body.append(div)

  type ElementsArray = Elements extends Array<Element> ? Elements : [Elements]
  return {
    element: div.firstChild as ElementsArray[0],
    elements: div.children as unknown as HTMLCollection<ElementsArray>,
    // for single elements add the listeners to the element for capturing non-bubbling events
    ...addListeners(
      div.children.length === 1 ? (div.firstChild as Element) : div,
      {
        eventHandlers,
      },
    ),
  }
}

function setupSelect({
  disabled = false,
  disabledOptions = false,
  multiple = false,
  pointerEvents = 'auto',
} = {}) {
  const form = document.createElement('form')
  form.innerHTML = `
    <select
      name="select"
      style="pointer-events: ${pointerEvents}"
      ${disabled ? 'disabled' : ''}
      ${multiple ? 'multiple' : ''}
    >
      <option value="1" ${disabledOptions ? 'disabled' : ''}>1</option>
      <option value="2" ${disabledOptions ? 'disabled' : ''}>2</option>
      <option value="3" ${disabledOptions ? 'disabled' : ''}>3</option>
    </select>
  `
  document.body.append(form)
  const select = form.querySelector('select') as HTMLSelectElement
  const options = Array.from(form.querySelectorAll('option'))
  return {
    ...addListeners(select),
    form,
    select,
    options,
  }
}

function setupListbox() {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = `
    <button id="button" aria-haspopup="listbox">
      Some label
    </button>
    <ul
      role="listbox"
      name="listbox"
      aria-labelledby="button"
    >
      <li id="1" role="option" aria-selected="false">1</li>
      <li id="2" role="option" aria-selected="false">2</li>
      <li id="3" role="option" aria-selected="false">3</li>
    </ul>
  `
  document.body.append(wrapper)
  const listbox = wrapper.querySelector('[role="listbox"]') as HTMLUListElement
  const options = Array.from(
    wrapper.querySelectorAll<HTMLElement>('[role="option"]'),
  )

  // the user is responsible for handling aria-selected on listbox options
  options.forEach(el =>
    el.addEventListener('click', e => {
      const target = e.currentTarget as HTMLElement
      target.setAttribute(
        'aria-selected',
        JSON.stringify(
          !JSON.parse(String(target.getAttribute('aria-selected'))),
        ),
      )
    }),
  )

  return {
    ...addListeners(listbox),
    listbox,
    options,
  }
}

const eventLabelGetters = {
  KeyboardEvent(event: KeyboardEvent) {
    return [
      event.key,
      typeof event.keyCode === 'undefined' ? null : `(${event.keyCode})`,
    ]
      .join(' ')
      .trim()
  },
  MouseEvent(event: MouseEvent) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    const mouseButtonMap: Record<number, string> = {
      0: 'Left',
      1: 'Middle',
      2: 'Right',
      3: 'Browser Back',
      4: 'Browser Forward',
    }
    return `${mouseButtonMap[event.button]} (${event.button})`
  },
} as const

let eventListeners: Array<{
  el: EventTarget
  type: string
  listener: EventListener
}> = []

// asside from the hijacked listener stuff here, it's also important to call
// this function rather than simply calling addEventListener yourself
// because it adds your listener to an eventListeners array which is cleaned
// up automatically which will help use avoid memory leaks.
function addEventListener(
  el: EventTarget,
  type: string,
  listener: EventListener,
  options?: AddEventListenerOptions,
) {
  eventListeners.push({el, type, listener})
  el.addEventListener(type, listener, options)
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
  } else if (
    isElementType(element, 'input', {type: 'checkbox'}) ||
    isElementType(element, 'input', {type: 'radio'}) ||
    isElementType(element, 'button')
  ) {
    // handled separately
    return null
  }

  return JSON.stringify((element as HTMLInputElement).value)
}

function hasProperty<T extends {}, K extends PropertyKey>(
  obj: T,
  prop: K,
): obj is T & {[k in K]: unknown} {
  return prop in obj
}

function getElementDisplayName(element: Element) {
  const value = getElementValue(element)
  const hasChecked =
    isElementType(element, 'input', {type: 'checkbox'}) ||
    isElementType(element, 'input', {type: 'radio'})
  return [
    element.tagName.toLowerCase(),
    element.id ? `#${element.id}` : null,
    hasProperty(element, 'name') && element.name
      ? `[name="${element.name}"]`
      : null,
    hasProperty(element, 'htmlFor') && element.htmlFor
      ? `[for="${element.htmlFor}"]`
      : null,
    value ? `[value=${value}]` : null,
    hasChecked ? `[checked=${element.checked}]` : null,
    isElementType(element, 'option') ? `[selected=${element.selected}]` : null,
    element.getAttribute('role') === 'option'
      ? `[aria-selected=${element.getAttribute('aria-selected')}]`
      : null,
  ]
    .filter(Boolean)
    .join('')
}

type CallData = {
  event: Event
  elementDisplayName: string
  testData?: TestData
}

type TestData = {
  handled?: boolean

  // Where is this assigned?
  before?: Element
  after?: Element
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

function isPointerEvent(event: Event): event is PointerEvent {
  return event.type.startsWith('pointer')
}

function addListeners(
  element: Element & {testData?: TestData},
  {
    eventHandlers = {},
  }: {
    eventHandlers?: EventHandlers
  } = {},
) {
  const eventHandlerCalls: {current: CallData[]} = {current: []}
  const generalListener = jest
    .fn((event: Event) => {
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
      eventHandlerCalls.current.push(callData)
    })
    .mockName('eventListener')
  const listeners = Object.keys(eventMap)

  for (const name of listeners) {
    addEventListener(element, name.toLowerCase(), (...args) => {
      if (name in eventHandlers) {
        generalListener(...args)
        return eventHandlers[name](...args)
      }
      return generalListener(...args)
    })
  }
  // prevent default of submits in tests
  if (isElementType(element, 'form')) {
    addEventListener(element, 'submit', e => e.preventDefault())
  }

  function getEventSnapshot() {
    const eventCalls = eventHandlerCalls.current
      .map(({event, testData, elementDisplayName}) => {
        const eventName = event.constructor.name
        const eventLabel =
          eventName in eventLabelGetters
            ? eventLabelGetters[eventName as keyof typeof eventLabelGetters](
                event as KeyboardEvent & MouseEvent,
              )
            : ''
        const modifiers = ['altKey', 'shiftKey', 'metaKey', 'ctrlKey']
          .filter(key => event[key as keyof Event])
          .map(k => `{${k.replace('Key', '')}}`)
          .join('')

        const firstLine = [
          `${elementDisplayName} - ${event.type}`,
          [eventLabel, modifiers].filter(Boolean).join(' '),
        ]
          .filter(Boolean)
          .join(': ')

        return [firstLine, testData?.before ? getChanges(testData) : null]
          .filter(Boolean)
          .join('\n')
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
  const clearEventCalls = () => {
    generalListener.mockClear()
    eventHandlerCalls.current = []
  }
  const getEvents = (type?: string) =>
    generalListener.mock.calls
      .map(([e]) => e)
      .filter(e => !type || e.type === type)
  const eventWasFired = (eventType: string) => getEvents(eventType).length > 0

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

  return {
    getEventSnapshot,
    getClickEventsSnapshot,
    clearEventCalls,
    getEvents,
    eventWasFired,
  }
}

function getValueWithSelection(element?: Element) {
  const {value, selectionStart, selectionEnd} = element as HTMLInputElement

  return [
    value.slice(0, selectionStart ?? undefined),
    ...(selectionStart === selectionEnd
      ? ['{CURSOR}']
      : [
          '{SELECTION}',
          value.slice(selectionStart ?? 0, selectionEnd ?? undefined),
          '{/SELECTION}',
        ]),
    value.slice(selectionEnd ?? undefined),
  ].join('')
}

const changeLabelGetter: Record<PropertyKey, (d: TestData) => string> = {
  value: ({before, after}) =>
    [
      JSON.stringify(getValueWithSelection(before)),
      JSON.stringify(getValueWithSelection(after)),
    ].join(' -> '),
  checked: ({before, after}) =>
    [
      (before as HTMLInputElement).checked ? 'checked' : 'unchecked',
      (after as HTMLInputElement).checked ? 'checked' : 'unchecked',
    ].join(' -> '),

  // unfortunately, changing a select option doesn't happen within fireEvent
  // but rather imperatively via `options.selected = newValue`
  // because of this we don't (currently) have a way to track before/after
  // in a given fireEvent call.
}
changeLabelGetter.selectionStart = changeLabelGetter.value
changeLabelGetter.selectionEnd = changeLabelGetter.value

const getDefaultLabel = <T>({
  key,
  before,
  after,
}: {
  key: keyof T
  before: T
  after: T
}) => `${key}: ${JSON.stringify(before[key])} -> ${JSON.stringify(after[key])}`

function getChanges({before, after}: TestData) {
  const changes = new Set()
  if (before && after) {
    for (const key of Object.keys(before) as Array<keyof typeof before>) {
      if (after[key] !== before[key]) {
        changes.add(
          (key in changeLabelGetter ? changeLabelGetter[key] : getDefaultLabel)(
            {key, before, after},
          ),
        )
      }
    }
  }

  return Array.from(changes)
    .filter(Boolean)
    .map(line => `  ${line}`)
    .join('\n')
}

// eslint-disable-next-line jest/prefer-hooks-on-top
afterEach(() => {
  for (const {el, type, listener} of eventListeners) {
    el.removeEventListener(type, listener)
  }
  eventListeners = []
  document.body.innerHTML = ''
})

export {setup, setupSelect, setupListbox, addEventListener, addListeners}
