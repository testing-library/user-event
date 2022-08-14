import {addListeners, EventHandlers} from './listeners'
import userEvent from '#src'
import {Options} from '#src/options'
import {FOCUSABLE_SELECTOR, getActiveElementOrBody} from '#src/utils'
import {setSelection} from '#src/event/selection'

export function render<Elements extends Element | Element[] = HTMLElement>(
  ui: string,
  {
    eventHandlers,
    focus,
    selection,
  }: {
    eventHandlers?: EventHandlers
    focus?: string | false
    selection?: {
      focusNode?: string
      anchorNode?: string
      focusOffset?: number
      anchorOffset?: number
    }
  } = {},
) {
  const div = document.createElement('div')
  div.innerHTML = ui.trim()
  document.body.append(div)

  if (typeof focus === 'string') {
    ;(assertSingleNodeFromXPath(focus, div) as HTMLElement).focus()
  } else if (focus !== false) {
    const element: HTMLElement | null = div.querySelector(FOCUSABLE_SELECTOR)
    if (element) {
      element.focus()
    } else if (div.firstChild) {
      ;(div.firstChild as HTMLElement).focus()
    }
  }

  if (selection) {
    const focusNode =
      typeof selection.focusNode === 'string'
        ? assertSingleNodeFromXPath(selection.focusNode, div)
        : getActiveElementOrBody(document)
    const anchorNode =
      typeof selection.anchorNode === 'string'
        ? assertSingleNodeFromXPath(selection.anchorNode, div)
        : focusNode
    const focusOffset = selection.focusOffset ?? 0
    const anchorOffset = selection.anchorOffset ?? focusOffset

    setSelection({
      focusNode,
      anchorNode,
      focusOffset,
      anchorOffset,
    })
  }

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
    xpathNode: <NodeType extends Node = HTMLElement>(xpath: string) =>
      assertSingleNodeFromXPath(xpath, div) as NodeType,
  }
}

function assertSingleNodeFromXPath(xpath: string, context: Node) {
  const node = document.evaluate(
    xpath,
    context,
    undefined,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
  ).singleNodeValue

  if (!node) {
    throw new Error(`invalid XPath: "${xpath}"`)
  }

  return node
}

export function setup<Elements extends Element | Element[] = HTMLElement>(
  ui: string,
  {
    eventHandlers,
    focus,
    selection,
    ...options
  }: Parameters<typeof render>[1] & Options = {},
) {
  return {
    user: userEvent.setup(options),
    ...render<Elements>(ui, {eventHandlers, focus, selection}),
  }
}
