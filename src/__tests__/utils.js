/* eslint-disable testing-library/no-node-access */
import {screen} from '@testing-library/dom'
import {isElementType, isVisible} from '../utils'
import {setup} from './helpers/utils'

describe('check element type per namespace, tagname and props', () => {
  test('check in HTML document', () => {
    const {elements} = setup(`<input readonly="true"/><textarea/>`)

    expect(isElementType(elements[0], 'input')).toBe(true)
    expect(isElementType(elements[0], 'input', {readOnly: false})).toBe(false)
    expect(isElementType(elements[1], 'input')).toBe(false)
    expect(isElementType(elements[1], ['input', 'textarea'])).toBe(true)
    expect(
      isElementType(elements[1], ['input', 'textarea'], {readOnly: false}),
    ).toBe(true)
  })

  test('check in XML document', () => {
    // const {element} = setup(`<input readonly="true"/>`)
    const dom = new DOMParser().parseFromString(
      `
      <root xmlns="http://example.com/foo">
        <input readonly="true"/>
        <input xmlns="http://www.w3.org/1999/xhtml" readonly="true"/>
      </root>
    `,
      'application/xml',
    )
    const xmlInput = dom.getElementsByTagNameNS(
      'http://example.com/foo',
      'input',
    )[0]
    const htmlInput = dom.getElementsByTagNameNS(
      'http://www.w3.org/1999/xhtml',
      'input',
    )[0]

    expect(isElementType(xmlInput, 'input')).toBe(false)
    expect(isElementType(htmlInput, 'input')).toBe(true)
    expect(isElementType(htmlInput, 'input', {readOnly: true})).toBe(true)
    expect(isElementType(htmlInput, 'input', {readOnly: false})).toBe(false)
  })
})

test('check if element is visible', () => {
  setup(`
    <input data-testid="visibleInput"/>
    <input data-testid="hiddenInput" hidden/>
    <input data-testid="styledHiddenInput" style="display: none">
    <input data-testid="styledDisplayedInput" hidden style="display: block"/>
    <div style="display: none"><input data-testid="childInput" /></div>
  `)

  expect(isVisible(screen.getByTestId('visibleInput'))).toBe(true)
  expect(isVisible(screen.getByTestId('styledDisplayedInput'))).toBe(true)
  expect(isVisible(screen.getByTestId('styledHiddenInput'))).toBe(false)
  expect(isVisible(screen.getByTestId('childInput'))).toBe(false)
  expect(isVisible(screen.getByTestId('hiddenInput'))).toBe(false)
})
