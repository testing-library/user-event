import {prepareInterceptor} from './interceptor'
import {setUISelectionClean} from './selection'
import {setUIValueClean} from './value'

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
