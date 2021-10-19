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
  ) => ImplReturn<ElementType[PropName]>,
) {
  const prototypeDescriptor = Object.getOwnPropertyDescriptor(
    element.constructor.prototype,
    propName,
  )

  const target = prototypeDescriptor?.set ? 'set' : 'value'
  if (
    typeof prototypeDescriptor?.[target] !== 'function' ||
    (prototypeDescriptor[target] as Interceptable)[Interceptor]
  ) {
    return
  }

  const realFunc = prototypeDescriptor[target] as (
    this: ElementType,
    ...args: unknown[]
  ) => unknown
  function intercept(
    this: ElementType,
    ...args: Params<ElementType[PropName]>
  ) {
    const realArgs = interceptorImpl.call(this, ...args)

    if (target === 'set') {
      realFunc.call(this, realArgs)
    } else {
      realFunc.call(this, ...realArgs)
    }
  }
  ;(intercept as Interceptable)[Interceptor] = Interceptor

  Object.defineProperty(element.constructor.prototype, propName, {
    ...prototypeDescriptor,
    [target]: intercept,
  })
}
