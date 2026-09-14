import {PointerEventsCheckLevel} from '../../options'
import {type Instance} from '../../setup'
import {getWindow} from '../misc/getWindow'
import {isElementType} from '../misc/isElementType'
import {ApiLevel, getLevelRef} from '../misc/level'

export function hasPointerEvents(
  instance: Instance,
  element: Element,
): boolean {
  return checkPointerEvents(instance, element)?.pointerEvents !== 'none'
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
      result: ReturnType<typeof closestPointerEventsDeclaration>
    }
  }
}

function checkPointerEvents(instance: Instance, element: Element) {
  const lastCheck = element[PointerEventsCheck]

  const needsCheck =
    instance.config.pointerEventsCheck !== PointerEventsCheckLevel.Never as number &&
    (!lastCheck ||
      (hasBitFlag(
        instance.config.pointerEventsCheck,
        PointerEventsCheckLevel.EachApiCall,
      ) &&
      lastCheck[ApiLevel.Call] !== getLevelRef(instance, ApiLevel.Call)) ||
      (hasBitFlag(
        instance.config.pointerEventsCheck,
        PointerEventsCheckLevel.EachTrigger,
      ) &&
      lastCheck[ApiLevel.Trigger] !==
      getLevelRef(instance, ApiLevel.Trigger)))

  if (!needsCheck) {
    return lastCheck?.result
  }

  const declaration = closestPointerEventsDeclaration(element)

  element[PointerEventsCheck] = {
    [ApiLevel.Call]: getLevelRef(instance, ApiLevel.Call),
    [ApiLevel.Trigger]: getLevelRef(instance, ApiLevel.Trigger),
    result: declaration,
  }

  return declaration
}

export function assertPointerEvents(instance: Instance, element: Element) {
  const declaration = checkPointerEvents(instance, element)

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
  return (conf & flag) > 0
}
