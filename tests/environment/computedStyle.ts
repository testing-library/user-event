import {isJsdomEnv, render} from '#testHelpers'

test('window.getComputedStyle returns resolved inherited style in browser', () => {
  const {element, xpathNode} = render(`
        <div style='pointer-events: none'>
            <button></button>
        </div>`)

  expect(window.getComputedStyle(element)).toHaveProperty(
    'pointer-events',
    'none',
  )
  expect(window.getComputedStyle(xpathNode('//button'))).toHaveProperty(
    'pointer-events',
    isJsdomEnv() ? '' : 'none',
  )
})
