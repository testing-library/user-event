import {isInstanceOfElement} from '../utils'
import {setup} from './helpers/utils'

// isInstanceOfElement can be removed once the peerDependency for @testing-library/dom is bumped to a version that includes https://github.com/testing-library/dom-testing-library/pull/885
describe('check element type per isInstanceOfElement', () => {
  let defaultViewDescriptor, spanDescriptor
  beforeAll(() => {
    defaultViewDescriptor = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(global.document),
      'defaultView',
    )
    spanDescriptor = Object.getOwnPropertyDescriptor(
      global.window,
      'HTMLSpanElement',
    )
  })
  afterEach(() => {
    Object.defineProperty(
      Object.getPrototypeOf(global.document),
      'defaultView',
      defaultViewDescriptor,
    )
    Object.defineProperty(global.window, 'HTMLSpanElement', spanDescriptor)
  })

  test('check in regular jest environment', () => {
    const {element} = setup(`<span></span>`)

    expect(element.ownerDocument.defaultView).toEqual(
      expect.objectContaining({
        HTMLSpanElement: expect.any(Function),
      }),
    )

    expect(isInstanceOfElement(element, 'HTMLSpanElement')).toBe(true)
    expect(isInstanceOfElement(element, 'HTMLDivElement')).toBe(false)
  })

  test('check in detached document', () => {
    const {element} = setup(`<span></span>`)

    Object.defineProperty(
      Object.getPrototypeOf(element.ownerDocument),
      'defaultView',
      {value: null},
    )

    expect(element.ownerDocument.defaultView).toBe(null)

    expect(isInstanceOfElement(element, 'HTMLSpanElement')).toBe(true)
    expect(isInstanceOfElement(element, 'HTMLDivElement')).toBe(false)
  })

  test('check in environment not providing constructors on window', () => {
    const {element} = setup(`<span></span>`)

    delete global.window.HTMLSpanElement

    expect(element.ownerDocument.defaultView.HTMLSpanElement).toBe(undefined)

    expect(isInstanceOfElement(element, 'HTMLSpanElement')).toBe(true)
    expect(isInstanceOfElement(element, 'HTMLDivElement')).toBe(false)
  })

  test('throw error if element is not created by HTML*Element constructor', () => {
    const doc = new Document()

    // constructor is global.Element
    const element = doc.createElement('span')

    expect(() => isInstanceOfElement(element, 'HTMLSpanElement')).toThrow()
  })
})
