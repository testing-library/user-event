import {HelloWorld} from './hello-world'
import {ShadowInput} from './shadow-input'

const customElements = {
  'hello-world': HelloWorld,
  'shadow-input': ShadowInput,
}

export type CustomElements = {
  [k in keyof typeof customElements]: typeof customElements[k] extends {
    new (): infer T
  }
    ? T
    : never
}

export function registerCustomElements() {
  Object.entries(customElements).forEach(([name, constructor]) => {
    if (!globalThis.customElements.get(name)) {
      globalThis.customElements.define(name, constructor)
    }
  })
}
