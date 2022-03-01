import {Config} from '../../setup'
import {EventType} from '../types'

export interface BehaviorPlugin<Type extends EventType> {
  (
    event: DocumentEventMap[Type],
    target: Element,
    config: Config,
  ): // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  void | (() => void) | (() => Promise<void>)
}

export const behavior: {
  [Type in EventType]?: BehaviorPlugin<Type>
} = {}
