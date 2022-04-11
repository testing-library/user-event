const Interceptor = Symbol('Interceptor for programmatical calls')

interface Interceptable {
  [Interceptor]?: typeof Interceptor
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type anyFunc = (...a: any[]) => any
type Params<Prop> = Prop extends anyFunc ? Parameters<Prop> : [Prop]
type ImplReturn<Prop> = Prop extends anyFunc ? Parameters<Prop> : Prop

export function prepareInterceptor<
  ElementType extends Node,
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

  if (
    typeof prototypeDescriptor?.[target] !== 'function' ||
    (prototypeDescriptor[target] as Interceptable)[Interceptor]
  ) {
    return
  }

  function intercept(
    this: ElementType,
    ...args: Params<ElementType[PropName]>
  ) {
    const {
      applyNative = true,
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
