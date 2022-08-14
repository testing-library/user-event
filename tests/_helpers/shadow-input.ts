const observed = ['value']

const template = document.createElement('template')
template.innerHTML = `
  <input>
`

export class ShadowInput extends HTMLElement {
  private $input?: HTMLInputElement

  static getObservedAttributes() {
    return observed
  }
  constructor() {
    super()

    this.attachShadow({mode: 'open', delegatesFocus: true})
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(template.content.cloneNode(true))
      this.$input = this.shadowRoot.querySelector('input') as HTMLInputElement
    }
    observed.forEach(name => {
      this.render(name, this.getAttribute(name))
    })
  }
  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal === newVal) return
    this.render(name, newVal)
  }

  render(name: string, value: string | null) {
    if (value == null) {
      this.$input?.removeAttribute(name)
    } else {
      this.$input?.setAttribute(name, value)
    }
  }

  public get value(): string {
    return this.$input?.value ?? ''
  }

  /**
   * Overwrite focus handling because delegatesFocus is not implemented in jsdom
   * @param options
   */
  public override focus(options?: FocusOptions) {
    super.focus(options)
    this.$input?.focus(options)
  }
}
window.customElements.define('shadow-input', ShadowInput)
