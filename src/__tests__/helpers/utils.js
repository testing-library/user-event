/* eslint-disable testing-library/no-node-access */
import {eventMap} from '@testing-library/dom/dist/event-map'
import {isElementType} from '../../utils'
// this is pretty helpful:
// https://codesandbox.io/s/quizzical-worker-eo909

// all of the stuff below is complex magic that makes the simpler tests work
// sorrynotsorry...

const unstringSnapshotSerializer = {
  test: val => val && val.hasOwnProperty('snapshot'),
  print: val => val.snapshot,
}

expect.addSnapshotSerializer(unstringSnapshotSerializer)

function setup(ui, {eventHandlers} = {}) {
  const div = document.createElement('div')
  div.innerHTML = ui.trim()
  document.body.append(div)

  return {
    element: div.firstChild,
    elements: div.children,
    // for single elements add the listeners to the element for capturing non-bubbling events
    ...addListeners(div.children.length === 1 ? div.firstChild : div, {
      eventHandlers,
    }),
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
  const select = form.querySelector('select')
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
  const listbox = wrapper.querySelector('[role="listbox"]')
  const options = Array.from(wrapper.querySelectorAll('[role="option"]'))

  // the user is responsible for handling aria-selected on listbox options
  options.forEach(el =>
    el.addEventListener('click', e =>
      e.target.setAttribute(
        'aria-selected',
        JSON.stringify(!JSON.parse(e.target.getAttribute('aria-selected'))),
      ),
    ),
  )

  return {
    ...addListeners(listbox),
    listbox,
    options,
  }
}

const eventLabelGetters = {
  KeyboardEvent(event) {
    return [
      event.key,
      typeof event.keyCode === 'undefined' ? null : `(${event.keyCode})`,
    ]
      .join(' ')
      .trim()
  },
  MouseEvent(event) {
    // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    const mouseButtonMap = {
      0: 'Left',
      1: 'Middle',
      2: 'Right',
      3: 'Browser Back',
      4: 'Browser Forward',
    }
    return `${mouseButtonMap[event.button]} (${event.button})`
  },
}

let eventListeners = []

// asside from the hijacked listener stuff here, it's also important to call
// this function rather than simply calling addEventListener yourself
// because it adds your listener to an eventListeners array which is cleaned
// up automatically which will help use avoid memory leaks.
function addEventListener(el, type, listener, options) {
  eventListeners.push({el, type, listener})
  el.addEventListener(type, listener, options)
}

function getElementValue(element) {
  if (isElementType(element, 'select') && element.multiple) {
    return JSON.stringify(Array.from(element.selectedOptions).map(o => o.value))
  } else if (element.getAttribute('role') === 'listbox') {
    return JSON.stringify(
      element.querySelector('[aria-selected="true"]')?.innerHTML,
    )
  } else if (element.getAttribute('role') === 'option') {
    return JSON.stringify(element.innerHTML)
  } else if (
    element.type === 'checkbox' ||
    element.type === 'radio' ||
    isElementType(element, 'button')
  ) {
    // handled separately
    return null
  }

  return JSON.stringify(element.value)
}

function getElementDisplayName(element) {
  const value = getElementValue(element)
  const hasChecked = element.type === 'checkbox' || element.type === 'radio'
  return [
    element.tagName.toLowerCase(),
    element.id ? `#${element.id}` : null,
    element.name ? `[name="${element.name}"]` : null,
    element.htmlFor ? `[for="${element.htmlFor}"]` : null,
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

function addListeners(element, {eventHandlers = {}} = {}) {
  const eventHandlerCalls = {current: []}
  const generalListener = jest
    .fn(event => {
      const callData = {
        event,
        elementDisplayName: getElementDisplayName(event.target),
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
      const handler = eventHandlers[name]
      if (handler) {
        generalListener(...args)
        return handler(...args)
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
        const eventLabel =
          eventLabelGetters[event.constructor.name]?.(event) ?? ''
        const modifiers = ['altKey', 'shiftKey', 'metaKey', 'ctrlKey']
          .filter(key => event[key])
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
  const getEvents = type =>
    generalListener.mock.calls
      .map(([e]) => e)
      .filter(e => !type || e.type === type)
  const eventWasFired = eventType => getEvents().some(e => e.type === eventType)

  function getClickEventsSnapshot() {
    const lines = getEvents().map(
      ({constructor, type, button, buttons, detail}) =>
        constructor.name === 'MouseEvent'
          ? `${type} - button=${button}; buttons=${buttons}; detail=${detail}`
          : type,
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

function getValueWithSelection({value, selectionStart, selectionEnd}) {
  return [
    value.slice(0, selectionStart),
    ...(selectionStart === selectionEnd
      ? ['{CURSOR}']
      : [
          '{SELECTION}',
          value.slice(selectionStart, selectionEnd),
          '{/SELECTION}',
        ]),
    value.slice(selectionEnd),
  ].join('')
}

const changeLabelGetter = {
  value: ({before, after}) =>
    [
      JSON.stringify(getValueWithSelection(before)),
      JSON.stringify(getValueWithSelection(after)),
    ].join(' -> '),
  checked: ({before, after}) =>
    [
      before.checked ? 'checked' : 'unchecked',
      after.checked ? 'checked' : 'unchecked',
    ].join(' -> '),

  // unfortunately, changing a select option doesn't happen within fireEvent
  // but rather imperatively via `options.selected = newValue`
  // because of this we don't (currently) have a way to track before/after
  // in a given fireEvent call.
}
changeLabelGetter.selectionStart = changeLabelGetter.value
changeLabelGetter.selectionEnd = changeLabelGetter.value
const getDefaultLabel = ({key, before, after}) =>
  `${key}: ${JSON.stringify(before[key])} -> ${JSON.stringify(after[key])}`

function getChanges({before, after}) {
  const changes = new Set()
  for (const key of Object.keys(before)) {
    if (after[key] !== before[key]) {
      changes.add(
        (changeLabelGetter[key] ?? getDefaultLabel)({key, before, after}),
      )
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
