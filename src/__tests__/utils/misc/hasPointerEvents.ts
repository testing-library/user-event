import {hasPointerEvents} from 'utils'
import {setup} from '__tests__/helpers/utils'

test('get pointer-events from element or ancestor', () => {
  const {element} = setup(`
        <div style="pointer-events: none">
            <input style="pointer-events: initial"/>
            <input style="pointer-events: inherit"/>
            <input/>
        </div>
    `)

  expect(hasPointerEvents(element as HTMLDivElement)).toBe(false)
  expect(hasPointerEvents((element as HTMLDivElement).children[0])).toBe(true)
  expect(hasPointerEvents((element as HTMLDivElement).children[1])).toBe(false)
  expect(hasPointerEvents((element as HTMLDivElement).children[2])).toBe(false)
})
