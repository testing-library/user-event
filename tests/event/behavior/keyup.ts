import cases from 'jest-in-case'
import {createConfig, createInstance} from '#src/setup/setup'
import {render} from '#testHelpers'

function setupInstance() {
  return createInstance(createConfig()).instance
}

cases(
  'trigger click for [Space]',
  ({html, hasClick = true, hasChange = false}) => {
    const {element, eventWasFired, getEvents} = render(html)

    setupInstance().dispatchUIEvent(element, 'keyup', {key: ' '})

    expect(eventWasFired('click')).toBe(hasClick)
    if (hasClick) {
      expect(getEvents('click')[0]).toHaveProperty('detail', 0)
    }

    expect(eventWasFired('change')).toBe(hasChange)
  },
  {
    'on checkbox': {
      html: `<input type="checkbox"/>`,
      hasChange: true,
    },
    'on radio': {
      html: `<input type="radio"/>`,
      hasChange: true,
    },
    'on button': {
      html: `<button/>`,
    },
    'omit on other element': {
      html: `<input/>`,
      hasClick: false,
    },
  },
)
