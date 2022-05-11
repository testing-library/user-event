import {PointerEventsCheckLevel} from '../../options'
import {Config} from '../../setup'
import {ApiLevel, getLevelRef} from '..'
import {getWindow} from '../misc/getWindow'

export function hasPointerEvents(element: Element): boolean {
  return closestPointerEventsDeclaration(element)?.pointerEvents !== 'none'
}

function closestPointerEventsDeclaration(element: Element):
  | {
      pointerEvents: string
      tree: Element[]
    }
  | undefined {
  const window = getWindow(element)

  for (
    let el: Element | null = element, tree: Element[] = [];
    el?.ownerDocument;
    el = el.parentElement
  ) {
    tree.push(el)
    const pointerEvents = window.getComputedStyle(el).pointerEvents
    if (pointerEvents && !['inherit', 'unset'].includes(pointerEvents)) {
      return {pointerEvents, tree}
    }
  }

  return undefined
}

const PointerEventsCheck = Symbol('Last check for pointer-events')
declare global {
  interface Element {
    [PointerEventsCheck]?: {
      [k in ApiLevel]?: object
    } & {
      result: boolean
    }
  }
}

export function assertPointerEvents(config: Config, element: Element) {
  const lastCheck = element[PointerEventsCheck]

  const needsCheck =
    config.pointerEventsCheck !== PointerEventsCheckLevel.Never &&
    (!lastCheck ||
      (hasBitFlag(
        config.pointerEventsCheck,
        PointerEventsCheckLevel.EachApiCall,
      ) &&
        lastCheck[ApiLevel.Call] !== getLevelRef(config, ApiLevel.Call)) ||
      (hasBitFlag(
        config.pointerEventsCheck,
        PointerEventsCheckLevel.EachTrigger,
      ) &&
        lastCheck[ApiLevel.Trigger] !== getLevelRef(config, ApiLevel.Trigger)))

  if (!needsCheck) {
    return
  }

  const declaration = closestPointerEventsDeclaration(element)

  element[PointerEventsCheck] = {
    [ApiLevel.Call]: getLevelRef(config, ApiLevel.Call),
    [ApiLevel.Trigger]: getLevelRef(config, ApiLevel.Trigger),
    result: declaration?.pointerEvents !== 'none',
  }

  if (declaration?.pointerEvents === 'none') {
    throw new Error(
      [
        `Unable to perform pointer interaction as the element ${
          declaration.tree.length > 1 ? 'inherits' : 'has'
        } \`pointer-events: none\`:`,
        '',
        printTree(declaration.tree),
      ].join('\n'),
    )
  }
}

function printTree(tree: Element[]) {
  return tree
    .reverse()
    .map((el, i) =>
      [
        ''.padEnd(i),
        el.tagName,
        el.id && `#${el.id}`,
        el.hasAttribute('data-testid') &&
          `(testId=${el.getAttribute('data-testid')})`,
        el.hasAttribute('aria-label') &&
          `(label=${el.getAttribute('aria-label')})`,
        el.hasAttribute('aria-labelledby') &&
          `(label=${
            el.ownerDocument.getElementById(
              el.getAttribute('aria-labelledby') ?? '',
            )?.textContent
          })`,
        tree.length > 1 &&
          i === 0 &&
          '  <-- This element declared `pointer-events: none`',
        tree.length > 1 &&
          i === tree.length - 1 &&
          '  <-- Asserted pointer events here',
      ]
        .filter(Boolean)
        .join(''),
    )
    .join('\n')
}

// With the eslint rule and prettier the bitwise operation isn't nice to read
function hasBitFlag(conf: number, flag: number) {
  // eslint-disable-next-line no-bitwise
  return (conf & flag) > 0
}
