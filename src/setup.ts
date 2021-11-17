import {clear} from './clear'
import {click, clickOptions, dblClick, tripleClick} from './click'
import {prepareDocument} from './document'
import {hover, unhover} from './hover'
import {createKeyboardState, keyboard, keyboardOptions} from './keyboard'
import type {keyboardState} from './keyboard/types'
import {
  copy,
  copyOptions,
  cut,
  cutOptions,
  paste,
  pasteOptions,
} from './clipboard'
import {createPointerState, pointer} from './pointer'
import type {pointerOptions, pointerState} from './pointer/types'
import {deselectOptions, selectOptions} from './selectOptions'
import {tab, tabOptions} from './tab'
import {type, typeOptions} from './type'
import {upload, uploadOptions} from './upload'
import {PointerOptions, attachClipboardStubToView} from './utils'

export const userEventApis = {
  clear,
  click,
  copy,
  cut,
  dblClick,
  deselectOptions,
  hover,
  keyboard,
  paste,
  pointer,
  selectOptions,
  tab,
  tripleClick,
  type,
  unhover,
  upload,
}
export type UserEventApis = typeof userEventApis
type setup = ReturnType<typeof _setup>['setup']
export type UserEvent = UserEventApis & {
  setup: setup
}

type ClickOptions = Omit<clickOptions, 'clickCount'>

interface ClipboardOptions extends copyOptions, cutOptions, pasteOptions {}

type KeyboardOptions = Partial<keyboardOptions>

type PointerApiOptions = Partial<pointerOptions>

type TabOptions = Omit<tabOptions, 'shift'>

type TypeOptions = Omit<
  typeOptions,
  'initialSelectionStart' | 'initialSelectionEnd'
>

type UploadOptions = uploadOptions

interface SetupOptions
  extends ClickOptions,
    ClipboardOptions,
    KeyboardOptions,
    PointerOptions,
    PointerApiOptions,
    TabOptions,
    TypeOptions,
    UploadOptions {}

/**
 * Start a "session" with userEvent.
 * All APIs returned by this function share an input device state and a default configuration.
 */
export function setup(options: SetupOptions = {}) {
  const doc = options.document ?? document
  prepareDocument(doc)

  const view = doc.defaultView ?? /* istanbul ignore next */ window
  attachClipboardStubToView(view)

  return _setup(options, {
    keyboardState: createKeyboardState(),
    pointerState: createPointerState(),
  })
}

function _setup(
  {
    applyAccept,
    autoModify,
    delay = 0,
    document,
    keyboardMap,
    pointerMap,
    skipAutoClose,
    skipClick,
    skipHover,
    skipPointerEventsCheck = false,
    // Changing default return type from DataTransfer to Promise<DataTransfer>
    // would require a lot of overloading right now.
    // The APIs returned by setup will most likely be changed to async before stable release anyway.
    // See https://github.com/testing-library/user-event/issues/504#issuecomment-944883855
    // So the default option can be changed during alpha instead of introducing too much code here.
    // TODO: This should default to true
    writeToClipboard = false,
  }: SetupOptions,
  {
    keyboardState,
    pointerState,
  }: {
    keyboardState: keyboardState
    pointerState: pointerState
  },
): UserEventApis & {
  /**
   * Create a set of callbacks with different default settings but the same state.
   */
  setup(options: SetupOptions): ReturnType<typeof _setup>
} {
  const keyboardDefaults: KeyboardOptions = {
    autoModify,
    delay,
    document,
    keyboardMap,
  }
  const pointerDefaults: PointerOptions = {
    skipPointerEventsCheck,
  }
  const pointerApiDefaults: PointerApiOptions = {
    delay,
    pointerMap,
  }
  const clickDefaults: clickOptions = {
    skipHover,
  }
  const clipboardDefaults: ClipboardOptions = {
    document,
    writeToClipboard,
  }
  const typeDefaults: TypeOptions = {
    delay,
    skipAutoClose,
    skipClick,
  }
  const uploadDefaults: UploadOptions = {
    applyAccept,
  }

  const userEvent: UserEvent = {
    clear: (...args: Parameters<typeof clear>) => {
      return clear.call(userEvent, ...args)
    },

    click: (...args: Parameters<typeof click>) => {
      args[1] = {...pointerDefaults, ...clickDefaults, ...args[1]}
      return click.call(userEvent, ...args)
    },

    // copy needs typecasting because of the overloading
    copy: ((...args: Parameters<typeof copy>) => {
      args[0] = {...clipboardDefaults, ...args[0]}
      return copy.call(userEvent, ...args)
    }) as typeof copy,

    // cut needs typecasting because of the overloading
    cut: ((...args: Parameters<typeof cut>) => {
      args[0] = {...clipboardDefaults, ...args[0]}
      return cut.call(userEvent, ...args)
    }) as typeof cut,

    dblClick: (...args: Parameters<typeof dblClick>) => {
      args[1] = {...pointerDefaults, ...clickDefaults, ...args[1]}
      return dblClick.call(userEvent, ...args)
    },

    deselectOptions: (...args: Parameters<typeof deselectOptions>) => {
      args[2] = {...pointerDefaults, ...args[2]}
      return deselectOptions.call(userEvent, ...args)
    },

    hover: (...args: Parameters<typeof hover>) => {
      args[1] = {...pointerDefaults, ...args[1]}
      return hover.call(userEvent, ...args)
    },

    // keyboard needs typecasting because of the overloading
    keyboard: ((...args: Parameters<typeof keyboard>) => {
      args[1] = {...keyboardDefaults, ...args[1], keyboardState}
      const ret = keyboard(...args) as keyboardState | Promise<keyboardState>
      if (ret instanceof Promise) {
        return ret.then(() => undefined)
      }
    }) as typeof keyboard,

    // paste needs typecasting because of the overloading
    paste: ((...args: Parameters<typeof paste>) => {
      args[1] = {...clipboardDefaults, ...args[1]}
      return paste.call(userEvent, ...args)
    }) as typeof paste,

    // pointer needs typecasting because of the overloading
    pointer: ((...args: Parameters<typeof pointer>) => {
      args[1] = {...pointerApiDefaults, ...args[1], pointerState, keyboardState}
      const ret = pointer(...args) as pointerState | Promise<pointerState>
      if (ret instanceof Promise) {
        return ret.then(() => undefined)
      }
    }) as typeof pointer,

    selectOptions: (...args: Parameters<typeof selectOptions>) => {
      args[2] = {...pointerDefaults, ...args[2]}
      return selectOptions.call(userEvent, ...args)
    },

    setup: (options: SetupOptions) => {
      return _setup(
        {
          ...keyboardDefaults,
          ...pointerDefaults,
          ...clickDefaults,
          ...options,
        },
        {
          keyboardState,
          pointerState,
        },
      )
    },

    tab: (...args: Parameters<typeof tab>) => {
      return tab.call(userEvent, ...args)
    },

    tripleClick: (...args: Parameters<typeof tripleClick>) => {
      return tripleClick.call(userEvent, ...args)
    },

    // type needs typecasting because of the overloading
    type: ((...args: Parameters<typeof type>) => {
      args[2] = {...typeDefaults, ...args[2]}
      return type.call(userEvent, ...args)
    }) as typeof type,

    unhover: (...args: Parameters<typeof unhover>) => {
      args[1] = {...pointerDefaults, ...args[1]}
      return unhover.call(userEvent, ...args)
    },

    upload: (...args: Parameters<typeof upload>) => {
      args[3] = {...uploadDefaults, ...args[3]}
      return upload.call(userEvent, ...args)
    },
  }

  return userEvent
}
