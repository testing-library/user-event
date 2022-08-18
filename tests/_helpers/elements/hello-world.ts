export class HelloWorld extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({
      mode: 'open',
      delegatesFocus: this.hasAttribute('delegates'),
    }).innerHTML = `<p>Hello, World!</p>`
  }
}
