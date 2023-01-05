import {fireEvent} from '@testing-library/dom'
import type {Instance} from '../setup'
import type {keyboardKey} from '../system/keyboard'
import {getActiveElementOrBody, wait} from '../utils'
import {parseKeyDef} from './parseKeyDef'

interface KeyboardAction {
  keyDef: keyboardKey
  releasePrevious: boolean
  releaseSelf: boolean
  repeat: number
}

export async function keyboard(this: Instance, text: string): Promise<void> {
  if (this.config.autoFocusDocumentBeforeTyping) {
    fireEvent.focus(getActiveElementOrBody(this.config.document))
  }
  const actions: KeyboardAction[] = parseKeyDef(this.config.keyboardMap, text)

  for (let i = 0; i < actions.length; i++) {
    await wait(this.config)

    await keyboardAction(this, actions[i])
  }
}

async function keyboardAction(
  instance: Instance,
  {keyDef, releasePrevious, releaseSelf, repeat}: KeyboardAction,
) {
  const {system} = instance

  // Release the key automatically if it was pressed before.
  if (system.keyboard.isKeyPressed(keyDef)) {
    await system.keyboard.keyup(instance, keyDef)
  }

  if (!releasePrevious) {
    for (let i = 1; i <= repeat; i++) {
      await system.keyboard.keydown(instance, keyDef)

      if (i < repeat) {
        await wait(instance.config)
      }
    }

    // Release the key only on the last iteration on `state.repeatKey`.
    if (releaseSelf) {
      await system.keyboard.keyup(instance, keyDef)
    }
  }
}

export async function releaseAllKeys(instance: Instance) {
  for (const k of instance.system.keyboard.getPressedKeys()) {
    await instance.system.keyboard.keyup(instance, k)
  }
}
