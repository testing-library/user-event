import userEvent from '#src'
import {addListeners} from '#testHelpers/utils'

// It is unclear which part of our implementation is targeted with this test.
// Can this be removed? Is it sufficient?

const observed = ['value']

class CustomEl extends HTMLElement {
  private $input: HTMLInputElement

  static getObservedAttributes() {
    return observed
  }

  constructor() {
    super()
    const shadowRoot = this.attachShadow({mode: 'open'})
    shadowRoot.innerHTML = `<input>`
    this.$input = shadowRoot.querySelector('input') as HTMLInputElement
  }

  connectedCallback() {
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
      this.$input.removeAttribute(name)
    } else {
      this.$input.setAttribute(name, value)
    }
  }
}

customElements.define('custom-el', CustomEl)

test('types text inside custom element', async () => {
  const element = document.createElement('custom-el')
  document.body.append(element)
  const inputEl = (element.shadowRoot as ShadowRoot).querySelector(
    'input',
  ) as HTMLInputElement
  const {getEventSnapshot} = addListeners(inputEl)

  await userEvent.type(inputEl, 'Sup')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Sup"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: S
    input[value=""] - keypress: S
    input[value="S"] - input
    input[value="S"] - keyup: S
    input[value="S"] - keydown: u
    input[value="S"] - keypress: u
    input[value="Su"] - input
    input[value="Su"] - keyup: u
    input[value="Su"] - keydown: p
    input[value="Su"] - keypress: p
    input[value="Sup"] - input
    input[value="Sup"] - keyup: p
  `)
})
