import {addListeners, EventHandlers} from './listeners'
import userEvent from '#src'
import {Options} from '#src/options'

export function render<Elements extends Element | Element[] = HTMLElement>(
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
  // The HTMLCollection in lib.d.ts does not allow array access
  type ElementsCollection = HTMLCollection &
    ElementsArray & {
      item<N extends number>(i: N): ElementsArray[N]
    }

  return {
    element: div.firstChild as ElementsArray[0],
    elements: div.children as ElementsCollection,
    // for single elements add the listeners to the element for capturing non-bubbling events
    ...addListeners(
      div.children.length === 1 ? (div.firstChild as Element) : div,
      {
        eventHandlers,
      },
    ),
  }
}

export function setup<Elements extends Element | Element[] = HTMLElement>(
  ui: string,
  {eventHandlers, ...options}: Parameters<typeof render>[1] & Options = {},
) {
  return {
    user: userEvent.setup(options),
    ...render<Elements>(ui, {eventHandlers}),
  }
}
