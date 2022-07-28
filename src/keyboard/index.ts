import {Config, Instance} from '../setup'
import {keyboardKey} from '../system/keyboard'
import {wait} from '../utils'
import {parseKeyDef} from './parseKeyDef'

interface KeyboardAction {
  keyDef: keyboardKey
  releasePrevious: boolean
  releaseSelf: boolean
  repeat: number
}

export async function keyboard(this: Instance, text: string): Promise<void> {
  const actions: KeyboardAction[] = parseKeyDef(this[Config].keyboardMap, text)

  for (let i = 0; i < actions.length; i++) {
    await wait(this[Config])

    await keyboardAction(this[Config], actions[i])
  }
}

async function keyboardAction(
  config: Config,
  {keyDef, releasePrevious, releaseSelf, repeat}: KeyboardAction,
) {
  const {system} = config

  // Release the key automatically if it was pressed before.
  if (system.keyboard.isKeyPressed(keyDef)) {
    await system.keyboard.keyup(config, keyDef)
  }

  if (!releasePrevious) {
    for (let i = 1; i <= repeat; i++) {
      await system.keyboard.keydown(config, keyDef)

      if (i < repeat) {
        await wait(config)
      }
    }

    // Release the key only on the last iteration on `state.repeatKey`.
    if (releaseSelf) {
      await system.keyboard.keyup(config, keyDef)
    }
  }
}

export async function releaseAllKeys(config: Config) {
  for (const k of config.system.keyboard.getPressedKeys()) {
    await config.system.keyboard.keyup(config, k)
  }
}
