import {configureDefaults, getDefaultOptions, Options} from '#src/options'

test('configureDefaults overrides global default values', () => {
  configureDefaults({
    usingFakeTimers: true,
    delay: null,
    writeToClipboard: false,
  })
  expect(getDefaultOptions('direct')).toMatchObject<Options>({
    usingFakeTimers: true,
    delay: null,
    writeToClipboard: false,
    skipHover: false,
  })
  expect(getDefaultOptions('setup')).toMatchObject<Options>({
    usingFakeTimers: true,
    delay: null,
    writeToClipboard: true,
    skipHover: false,
  })
})
