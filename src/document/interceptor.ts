import {isElementType} from '../utils'
import {startTrackValue, trackOrSetValue} from './trackValue'
import {
  getUIValue,
  isUISelectionStart,
  isUIValue,
  setUISelectionClean,
  setUISelectionRaw,
  setUIValueClean,
  UISelectionStart,
  UIValueString,
} from './UI'

const Interceptor = Symbol('Interceptor for programmatical calls')

interface Interceptable {
  [Interceptor]?: typeof Interceptor
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type anyFunc = (...a: any[]) => any
type Params<Prop> = Prop extends anyFunc ? Parameters<Prop> : [Prop]
type ImplReturn<Prop> = Prop extends anyFunc ? Parameters<Prop> : Prop

export function prepareInterceptor<
  ElementType extends Element,
  PropName extends keyof ElementType,
>(
  element: ElementType,
  propName: PropName,
  interceptorImpl: (
    this: ElementType,
    ...args: Params<ElementType[PropName]>
  ) => {
    /**
     * React tracks the changes on element properties.
     * This workaround tries to alter the DOM element without React noticing,
     * so that it later picks up the change.
     *
     * @see https://github.com/facebook/react/blob/148f8e497c7d37a3c7ab99f01dec2692427272b1/packages/react-dom/src/client/inputValueTracking.js#L51-L104
     */
    applyNative?: boolean
    realArgs?: ImplReturn<ElementType[PropName]>
    then?: () => void
  },
) {
  const prototypeDescriptor = Object.getOwnPropertyDescriptor(
    element.constructor.prototype,
    propName,
  )
  const objectDescriptor = Object.getOwnPropertyDescriptor(element, propName)

  const target = prototypeDescriptor?.set ? 'set' : 'value'

  /* istanbul ignore if */
  if (
    typeof prototypeDescriptor?.[target] !== 'function' ||
    (prototypeDescriptor[target] as Interceptable)[Interceptor]
  ) {
    throw new Error(
      `Element ${element.tagName} does not implement "${String(propName)}".`,
    )
  }

  function intercept(
    this: ElementType,
    ...args: Params<ElementType[PropName]>
  ) {
    const {
      applyNative = false,
      realArgs,
      then,
    } = interceptorImpl.call(this, ...args)

    const realFunc = ((!applyNative && objectDescriptor) ||
      (prototypeDescriptor as PropertyDescriptor))[target] as (
      this: ElementType,
      ...a: unknown[]
    ) => unknown

    if (target === 'set') {
      realFunc.call(this, realArgs)
    } else {
      realFunc.call(this, ...realArgs)
    }

    then?.()
  }
  ;(intercept as Interceptable)[Interceptor] = Interceptor

  Object.defineProperty(element, propName, {
    ...(objectDescriptor ?? prototypeDescriptor),
    [target]: intercept,
  })
}

export function prepareValueInterceptor(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  prepareInterceptor(
    element,
    'value',
    function interceptorImpl(
      this: HTMLInputElement | HTMLTextAreaElement,
      v: UIValueString | string,
    ) {
      const isUI = isUIValue(v)

      if (isUI) {
        startTrackValue(this)
      }

      return {
        applyNative: !!isUI,
        realArgs: sanitizeValue(this, v),
        then: isUI ? undefined : () => trackOrSetValue(this, String(v)),
      }
    },
  )
}

function sanitizeValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  v: UIValueString | string,
) {
  // Workaround for JSDOM
  if (
    isElementType(element, 'input', {type: 'number'}) &&
    String(v) !== '' &&
    !Number.isNaN(Number(v))
  ) {
    // Setting value to "1." results in `null` in JSDOM
    return String(Number(v))
  }
  return String(v)
}

export function prepareSelectionInterceptor(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  prepareInterceptor(
    element,
    'setSelectionRange',
    function interceptorImpl(
      this: HTMLInputElement | HTMLTextAreaElement,
      start: number | UISelectionStart | null,
      ...others: [
        end: number | null,
        direction?: 'forward' | 'backward' | 'none',
      ]
    ) {
      const isUI = isUISelectionStart(start)

      return {
        applyNative: !!isUI,
        realArgs: [Number(start), ...others] as [number, number, undefined],
        then: () => (isUI ? undefined : setUISelectionClean(element)),
      }
    },
  )

  prepareInterceptor(
    element,
    'selectionStart',
    function interceptorImpl(this, v) {
      return {
        realArgs: v,
        then: () => setUISelectionClean(element),
      }
    },
  )
  prepareInterceptor(
    element,
    'selectionEnd',
    function interceptorImpl(this, v) {
      return {
        realArgs: v,
        then: () => setUISelectionClean(element),
      }
    },
  )

  prepareInterceptor(
    element,
    'select',
    function interceptorImpl(this: HTMLInputElement | HTMLTextAreaElement) {
      return {
        realArgs: [] as [],
        then: () =>
          setUISelectionRaw(element, {
            anchorOffset: 0,
            focusOffset: getUIValue(element).length,
          }),
      }
    },
  )
}

export function prepareRangeTextInterceptor(
  element: HTMLInputElement | HTMLTextAreaElement,
) {
  prepareInterceptor(
    element,
    'setRangeText',
    function interceptorImpl(...realArgs) {
      return {
        realArgs,
        then: () => {
          setUIValueClean(element)
          setUISelectionClean(element)
        },
      }
    },
  )
}
