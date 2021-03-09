import {callbackPayload} from '../callbacks'
import {getValue} from '../../utils/edit'

export function handleSelectall({currentElement}: callbackPayload) {
  ;(currentElement() as HTMLInputElement).setSelectionRange(
    0,
    (getValue(currentElement() as HTMLInputElement) as string).length,
  )

  return undefined
}
