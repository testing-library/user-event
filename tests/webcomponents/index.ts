import {setup} from '#testHelpers'

const template = document.createElement('template')
template.innerHTML = `
  <input>
`

class ShadowInput extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({mode: 'open', delegatesFocus: true})
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(template.content.cloneNode(true))
    }
  }

  public get value(): string {
    return this.shadowRoot?.querySelector('input')?.value ?? ''
  }
}

test('Render open shadow DOM element', async () => {
  window.customElements.define('shadow-input', ShadowInput)
  const {element, user} = setup('<shadow-input></shadow-input>', {
    focus: false,
  })

  const inputElement = element.shadowRoot?.querySelector('input')
  if (inputElement) {
    await user.click(inputElement)
  }
  await user.keyboard('test')
  await user.paste('test')
  expect((element as ShadowInput).value).toEqual('testtest')
})
