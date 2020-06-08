import {render} from '@testing-library/react'

// this is pretty helpful:
// https://jsbin.com/nimelileyo/edit?js,output

// all of the stuff below is complex magic that makes the simpler tests work
// sorrynotsorry...

const unstringSnapshotSerializer = {
  test: val => typeof val === 'string',
  print: val => val,
}

expect.addSnapshotSerializer(unstringSnapshotSerializer)

let eventListeners = []

function getTestData(element) {
  return {
    value: element.value,
    selectionStart: element.selectionStart,
    selectionEnd: element.selectionEnd,
    checked: element.checked,
  }
}

function addEventListener(el, type, listener, options) {
  const hijackedListener = e => {
    e.testData = {previous: e.target.previousTestData}
    const retVal = listener(e)
    const next = getTestData(e.target)
    e.testData.next = next
    e.target.previousTestData = next
    return retVal
  }
  eventListeners.push({el, type, listener: hijackedListener})
  el.addEventListener(type, hijackedListener, options)
}

function setup(ui) {
  const {
    container: {firstChild: element},
  } = render(ui)

  element.previousTestData = getTestData(element)

  const {getEventCalls, clearEventCalls} = addListeners(element)
  return {element, getEventCalls, clearEventCalls}
}

function addListeners(element) {
  const generalListener = jest.fn().mockName('eventListener')
  const listeners = [
    'keydown',
    'keyup',
    'keypress',
    'input',
    'change',
    'blur',
    'focus',
    'click',
    'mouseover',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'mouseup',
    'mousedown',
  ]

  for (const name of listeners) {
    addEventListener(element, name, generalListener)
  }
  function getEventCalls() {
    return generalListener.mock.calls
      .map(([event]) => {
        const window = event.target.ownerDocument.defaultView
        const modifiers = ['altKey', 'shiftKey', 'metaKey', 'ctrlKey']
          .filter(key => event[key])
          .map(k => `{${k.replace('Key', '')}}`)
          .join('')

        if (
          event.type === 'click' &&
          event.hasOwnProperty('testData') &&
          (element.type === 'checkbox' || element.type === 'radio')
        ) {
          return getCheckboxOrRadioClickedLine(event)
        }

        if (event.type === 'input' && event.hasOwnProperty('testData')) {
          return getInputLine(element, event)
        }

        if (event instanceof window.KeyboardEvent) {
          return getKeyboardEventLine(event, modifiers)
        }

        if (event instanceof window.MouseEvent) {
          return getMouseEventLine(event, modifiers)
        }

        return [event.type, modifiers].join(' ').trim()
      })
      .join('\n')
  }
  const clearEventCalls = () => generalListener.mockClear()
  return {getEventCalls, clearEventCalls}
}

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const mouseButtonMap = {
  0: 'Left',
  1: 'Middle',
  2: 'Right',
  3: 'Browser Back',
  4: 'Browser Forward',
}
function getMouseEventLine(event, modifiers) {
  return [
    `${event.type}:`,
    mouseButtonMap[event.button],
    `(${event.button})`,
    modifiers,
  ]
    .join(' ')
    .trim()
}

function getKeyboardEventLine(event, modifiers) {
  return [
    `${event.type}:`,
    event.key,
    typeof event.keyCode === 'undefined' ? null : `(${event.keyCode})`,
    modifiers,
  ]
    .join(' ')
    .trim()
}

function getCheckboxOrRadioClickedLine(event) {
  const {previous, next} = event.testData

  return `${event.type}: ${previous.checked ? '' : 'un'}checked -> ${
    next.checked ? '' : 'un'
  }checked`
}

function getInputLine(element, event) {
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    const {previous, next} = event.testData

    if (element.type === 'checkbox' || element.type === 'radio') {
      return `${event.type}: ${next.checked ? '' : 'un'}checked`
    } else {
      const prevVal = [
        previous.value.slice(0, previous.selectionStart),
        ...(previous.selectionStart === previous.selectionEnd
          ? ['{CURSOR}']
          : [
              '{SELECTION}',
              previous.value.slice(
                previous.selectionStart,
                previous.selectionEnd,
              ),
              '{/SELECTION}',
            ]),
        previous.value.slice(previous.selectionEnd),
      ].join('')
      return `${event.type}: "${prevVal}" -> "${next.value}"`
    }
  } else {
    throw new Error(
      `fired ${event.type} event on a ${element.tagName} which probably doesn't make sense. Fix that, or handle it in the setup function`,
    )
  }
}

// eslint-disable-next-line jest/prefer-hooks-on-top
afterEach(() => {
  for (const {el, type, listener} of eventListeners) {
    el.removeEventListener(type, listener)
  }
  eventListeners = []
})

export {setup, addEventListener, addListeners}
