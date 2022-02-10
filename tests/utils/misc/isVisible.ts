import {screen} from '@testing-library/dom'
import {isVisible} from '#src/utils'
import {setup} from '#testHelpers'

test('check if element is visible', async () => {
  setup(`
    <input data-testid="visibleInput"/>
    <input data-testid="hiddenInput" hidden/>
    <input data-testid="styledHiddenInput" style="display: none">
    <input data-testid="styledDisplayedInput" hidden style="display: block"/>
    <div style="display: none"><input data-testid="childInput" /></div>
    <input data-testid="styledVisibiliyHiddenInput" style="visibility: hidden">
  `)

  expect(isVisible(screen.getByTestId('visibleInput'))).toBe(true)
  expect(isVisible(screen.getByTestId('styledDisplayedInput'))).toBe(true)
  expect(isVisible(screen.getByTestId('styledHiddenInput'))).toBe(false)
  expect(isVisible(screen.getByTestId('childInput'))).toBe(false)
  expect(isVisible(screen.getByTestId('hiddenInput'))).toBe(false)
  expect(isVisible(screen.getByTestId('styledVisibiliyHiddenInput'))).toBe(
    false,
  )
})
