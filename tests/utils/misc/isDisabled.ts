import cases from 'jest-in-case'
import {isDisabled} from '#src/utils'
import {render} from '#testHelpers'

customElements.define(
  'form-associated',
  class FormAssociated extends HTMLElement {
    static formAssociated = true
    get disabled() {
      return this.hasAttribute('disabled')
    }
  },
)

customElements.define(
  'custom-el',
  class CustomEl extends HTMLElement {
    get disabled() {
      return this.hasAttribute('disabled')
    }
  },
)

// https://html.spec.whatwg.org/multipage/semantics-other.html#disabled-elements
// https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#enabling-and-disabling-form-controls:-the-disabled-attribute
cases(
  'check if element is disabled',
  ({html, node = '//input', expected = true}) => {
    const {xpathNode} = render(html)
    expect(isDisabled(xpathNode<Element>(node))).toBe(expected)
  },
  {
    control: {
      html: `<input/>`,
      expected: false,
    },
    'disabled control': {
      html: `<input disabled/>`,
    },
    'control in disabled fieldset': {
      html: `<fieldset disabled><input/></fieldset>`,
    },
    'control in first legend of disabled fieldset': {
      html: `<fieldset disabled><legend><input/></legend></fieldset>`,
      expected: false,
    },
    'control in other legend of disabled fieldset': {
      html: `<fieldset disabled><legend></legend><legend><input/></legend></fieldset>`,
    },
    'element without support for disabled': {
      html: `<div disabled></div>`,
      node: '*',
      expected: false,
    },
    'form-associated disabled custom element': {
      html: `<form-associated disabled></form-associated>`,
      node: '*',
    },
    'form-associated enabled custom element': {
      html: `<form-associated></form-associated>`,
      node: '*',
      expected: false,
    },
    'other custom element': {
      html: `<custom-el disabled></custom-el>`,
      node: '*',
      expected: false,
    },
  },
)
