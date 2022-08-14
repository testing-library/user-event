import userEvent from '#src'
import {addListeners, setup} from '#testHelpers'
import {setUISelection} from '#src/document'

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
    input[value=""] - beforeinput
    input[value="S"] - input
    input[value="S"] - keyup: S
    input[value="S"] - keydown: u
    input[value="S"] - keypress: u
    input[value="S"] - beforeinput
    input[value="Su"] - input
    input[value="Su"] - keyup: u
    input[value="Su"] - keydown: p
    input[value="Su"] - keypress: p
    input[value="Su"] - beforeinput
    input[value="Sup"] - input
    input[value="Sup"] - keyup: p
  `)
})

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
window.customElements.define('shadow-input', ShadowInput)

test('Render open shadow DOM element - type', async () => {
  const {element, user} = setup('<shadow-input></shadow-input>', {
    focus: false,
  })

  const inputElement = element.shadowRoot?.querySelector('input')
  if (inputElement) {
    await user.click(inputElement)
  }
  await user.keyboard('test')

  expect((element as ShadowInput).value).toEqual('test')
})

describe('on shadow DOM', () => {
  test('copy', async () => {
  const {element, user} = setup('<shadow-input></shadow-input>', {
    focus: false,
  })

  const inputElement = element.shadowRoot?.querySelector('input')
  if (inputElement) {
    await user.click(inputElement)
  }
  await user.keyboard('test')

  if (inputElement) {
    setUISelection(inputElement, {anchorOffset: 0, focusOffset: 4})
  }

  const data = await user.copy()

  expect(data?.getData('text')).toEqual('test')
})

test('Render open shadow DOM element - paste', async () => {
  const {element, user} = setup('<shadow-input></shadow-input>', {
    focus: false,
  })

  const inputElement = element.shadowRoot?.querySelector('input')
  if (inputElement) {
    await user.click(inputElement)
  }

  await user.paste('test')

  expect((element as ShadowInput).value).toEqual('test')
})

test('Render open shadow DOM element - cut', async () => {
  const {element, user} = setup('<shadow-input></shadow-input>', {
    focus: false,
  })

  const inputElement = element.shadowRoot?.querySelector('input')
  if (inputElement) {
    await user.click(inputElement)
  }
  await user.keyboard('test')

  if (inputElement) {
    setUISelection(inputElement, {anchorOffset: 0, focusOffset: 4})
  }

  const data = await user.cut()

  expect(data?.getData('text')).toEqual('test')
  expect((element as ShadowInput).value.length).toEqual(0)
})
