import DOMTestingLibrary from '#src/_interop/dtl'
import {isVisible} from '#src/utils'
import {setup} from '#testHelpers'

const {screen} = DOMTestingLibrary

test('check if element is visible', async () => {
  setup(`
    <input data-testid="visibleInput"/>
    <input data-testid="hiddenInput" hidden/>
    <input data-testid="styledHiddenInput" style="display: none">
    <input data-testid="styledDisplayedInput" hidden style="display: block"/>
    <div style="display: none"><input data-testid="childInput" /></div>
    <input data-testid="styledVisibiliyHiddenInput" style="visibility: hidden">
    <details>
      <input data-testid="collapsedInput">
    </details>
    <details open>
      <input data-testid="expandedInput">
    </details>
    <details>
      <summary data-testid="summary"></summary>
    </details>
  `)

  expect(isVisible(screen.getByTestId('visibleInput'))).toBe(true)
  expect(isVisible(screen.getByTestId('styledDisplayedInput'))).toBe(true)
  expect(isVisible(screen.getByTestId('styledHiddenInput'))).toBe(false)
  expect(isVisible(screen.getByTestId('childInput'))).toBe(false)
  expect(isVisible(screen.getByTestId('hiddenInput'))).toBe(false)
  expect(isVisible(screen.getByTestId('styledVisibiliyHiddenInput'))).toBe(
    false,
  )
  expect(isVisible(screen.getByTestId('collapsedInput'))).toBe(false)
  expect(isVisible(screen.getByTestId('expandedInput'))).toBe(true)
  expect(isVisible(screen.getByTestId('summary'))).toBe(true)
})
