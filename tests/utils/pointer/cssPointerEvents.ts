import {createConfig} from '#src/setup/setup'
import {assertPointerEvents, hasPointerEvents} from '#src/utils'
import {setup} from '#testHelpers'

test('get pointer-events from element or ancestor', async () => {
  const {element} = setup(`
        <div style="pointer-events: none">
            <input style="pointer-events: initial"/>
            <input style="pointer-events: inherit"/>
            <input/>
        </div>
    `)

  expect(hasPointerEvents(element)).toBe(false)
  expect(hasPointerEvents(element.children[0])).toBe(true)
  expect(hasPointerEvents(element.children[1])).toBe(false)
  expect(hasPointerEvents(element.children[2])).toBe(false)
})

test('report element that declared pointer-events', async () => {
  const {element} = setup(`
    <div id="foo" style="pointer-events: none">
      <span id="listlabel">Some list</span>
      <ul aria-labelledby="listlabel">
        <li aria-label="List entry">
          <span data-testid="target"></span>
        </li>
      </ul>
    </div>
  `)

  expect(() => assertPointerEvents(createConfig(), element))
    .toThrowErrorMatchingInlineSnapshot(`
    Unable to perform pointer interaction as the element has \`pointer-events: none\`:

    DIV#foo
  `)

  expect(() =>
    assertPointerEvents(
      createConfig(),
      element.querySelector('[data-testid="target"]') as Element,
    ),
  ).toThrowErrorMatchingInlineSnapshot(`
    Unable to perform pointer interaction as the element inherits \`pointer-events: none\`:

    DIV#foo  <-- This element declared \`pointer-events: none\`
     UL(label=Some list)
      LI(label=List entry)
       SPAN(testId=target)  <-- Asserted pointer events here
  `)
})
