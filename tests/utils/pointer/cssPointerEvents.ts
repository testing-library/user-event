import {createConfig, createInstance} from '#src/setup/setup'
import {assertPointerEvents, hasPointerEvents} from '#src/utils'
import {isJsdomEnv, setup} from '#testHelpers'

function setupInstance() {
  return createInstance(createConfig()).instance
}

test('get pointer-events from element or ancestor', async () => {
  const {element} = setup(`
        <div style="pointer-events: none">
            <input style="pointer-events: initial"/>
            <input style="pointer-events: inherit"/>
            <input/>
        </div>
    `)

  expect(hasPointerEvents(setupInstance(), element)).toBe(false)
  expect(hasPointerEvents(setupInstance(), element.children[0])).toBe(true)
  expect(hasPointerEvents(setupInstance(), element.children[1])).toBe(false)
  expect(hasPointerEvents(setupInstance(), element.children[2])).toBe(false)
})

test('report element that declared pointer-events', async () => {
  const {element} = setup(`
    <div id="foo" style="pointer-events: none">
      <span id="listlabel">Some list</span>
      <ul aria-labelledby="listlabel">
        <li aria-label="List entry">
          <span data-testid="target"></span>
          <button>foo</button>
          <label>
            An input element with a really long label text
            <input/>
          </label>
        </li>
      </ul>
    </div>
  `)

  expect(() => assertPointerEvents(setupInstance(), element))
    .toThrowErrorMatchingInlineSnapshot(`
    Unable to perform pointer interaction as the element has \`pointer-events: none\`:

    DIV#foo
  `)

  if (!isJsdomEnv()) {
    // In the browser `window.getComputedStyle` includes inherited styles.
    // Therefore we can not distinguish between inherited `pointer-events` declarations
    // and those applied to the element itself.
    return
  }

  expect(() =>
    assertPointerEvents(
      setupInstance(),
      element.querySelector('[data-testid="target"]') as Element,
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    Unable to perform pointer interaction as the element inherits \`pointer-events: none\`:

    DIV#foo  <-- This element declared \`pointer-events: none\`
     UL(label=Some list)
      LI(label=List entry)
       SPAN(testId=target)  <-- Asserted pointer events here
  `)

  expect(() =>
    assertPointerEvents(
      setupInstance(),
      element.querySelector('button') as Element,
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    Unable to perform pointer interaction as the element inherits \`pointer-events: none\`:

    DIV#foo  <-- This element declared \`pointer-events: none\`
     UL(label=Some list)
      LI(label=List entry)
       BUTTON(label=foo)  <-- Asserted pointer events here
  `)

  expect(() =>
    assertPointerEvents(
      setupInstance(),
      element.querySelector('input') as Element,
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    Unable to perform pointer interaction as the element inherits \`pointer-events: none\`:

    DIV#foo  <-- This element declared \`pointer-events: none\`
     UL(label=Some list)
      LI(label=List entry)
       LABEL
        INPUT(label=An input element with a reall…)  <-- Asserted pointer events here
  `)
})
