import {clear} from './clear'
import {click, clickOptions, dblClick} from './click'
import {prepareDocument} from './document'
import {hover, unhover} from './hover'
import {createKeyboardState, keyboard, keyboardOptions} from './keyboard'
import type {keyboardState} from './keyboard/types'
import {paste} from './paste'
import {createPointerState, pointer} from './pointer'
import type {pointerOptions, pointerState} from './pointer/types'
import {deselectOptions, selectOptions} from './select-options'
import {tab, tabOptions} from './tab'
import {type} from './type'
import {typeOptions} from './type/typeImplementation'
import {upload, uploadOptions} from './upload'
import {PointerOptions} from './utils'

export const userEventApis = {
  clear,
  click,
  dblClick,
  deselectOptions,
  hover,
  keyboard,
  paste,
  pointer,
  selectOptions,
  tab,
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
  prepareDocument(options.document ?? document)

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
    focusTrap,
    keyboardMap,
    pointerMap,
    skipAutoClose,
    skipClick,
    skipHover,
    skipPointerEventsCheck = false,
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
  const tabDefaults: TabOptions = {
    focusTrap,
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
      args[2] = {...pointerDefaults, ...clickDefaults, ...args[2]}
      return click.call(userEvent, ...args)
    },

    dblClick: (...args: Parameters<typeof dblClick>) => {
      args[2] = {...pointerDefaults, ...clickDefaults, ...args[2]}
      return dblClick.call(userEvent, ...args)
    },

    deselectOptions: (...args: Parameters<typeof deselectOptions>) => {
      args[3] = {...pointerDefaults, ...args[3]}
      return deselectOptions.call(userEvent, ...args)
    },

    hover: (...args: Parameters<typeof hover>) => {
      args[2] = {...pointerDefaults, ...args[2]}
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

    paste: (...args: Parameters<typeof paste>) => {
      return paste.call(userEvent, ...args)
    },

    // pointer needs typecasting because of the overloading
    pointer: ((...args: Parameters<typeof pointer>) => {
      args[1] = {...pointerApiDefaults, ...args[1], pointerState, keyboardState}
      const ret = pointer(...args) as pointerState | Promise<pointerState>
      if (ret instanceof Promise) {
        return ret.then(() => undefined)
      }
    }) as typeof pointer,

    selectOptions: (...args: Parameters<typeof selectOptions>) => {
      args[3] = {...pointerDefaults, ...args[3]}
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
      args[0] = {...tabDefaults, ...args[0]}
      return tab.call(userEvent, ...args)
    },

    // type needs typecasting because of the overloading
    type: ((...args: Parameters<typeof type>) => {
      args[2] = {...typeDefaults, ...args[2]}
      return type.call(userEvent, ...args)
    }) as typeof type,

    unhover: (...args: Parameters<typeof unhover>) => {
      args[2] = {...pointerDefaults, ...args[2]}
      return unhover.call(userEvent, ...args)
    },

    upload: (...args: Parameters<typeof upload>) => {
      args[3] = {...uploadDefaults, ...args[3]}
      return upload.call(userEvent, ...args)
    },
  }

  return userEvent
}
