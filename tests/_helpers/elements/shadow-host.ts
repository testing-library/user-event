export class ShadowHost extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({
      mode: 'open',
      delegatesFocus: true,
    }).innerHTML = `${this.getAttribute('innerHTML')}`
  }
}
