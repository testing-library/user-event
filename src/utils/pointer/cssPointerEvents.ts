import {PointerEventsCheckLevel} from '../../options'
import {Config} from '../../setup'
import {ApiLevel, getLevelRef} from '..'
import {getWindow} from '../misc/getWindow'
import {isElementType} from '../misc/isElementType'

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
        getLabelDescr(el),
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

function getLabelDescr(element: Element) {
  let label: string | undefined | null
  if (element.hasAttribute('aria-label')) {
    label = element.getAttribute('aria-label') as string
  } else if (element.hasAttribute('aria-labelledby')) {
    label = element.ownerDocument
      .getElementById(element.getAttribute('aria-labelledby') as string)
      ?.textContent?.trim()
  } else if (
    isElementType(element, [
      'button',
      'input',
      'meter',
      'output',
      'progress',
      'select',
      'textarea',
    ]) &&
    element.labels?.length
  ) {
    label = Array.from(element.labels)
      .map(el => el.textContent?.trim())
      .join('|')
  } else if (isElementType(element, 'button')) {
    label = element.textContent?.trim()
  }
  label = label?.replace(/\n/g, '  ')
  if (Number(label?.length) > 30) {
    label = `${label?.substring(0, 29)}…`
  }
  return label ? `(label=${label})` : ''
}

// With the eslint rule and prettier the bitwise operation isn't nice to read
function hasBitFlag(conf: number, flag: number) {
  // eslint-disable-next-line no-bitwise
  return (conf & flag) > 0
}
