import {clear} from 'clear'
import {click, clickOptions, dblClick} from 'click'
import {hover, unhover} from 'hover'
import {createKeyboardState, keyboard, keyboardOptions} from 'keyboard'
import type {keyboardState} from 'keyboard/types'
import {paste} from 'paste'
import {deselectOptions, selectOptions} from 'select-options'
import {tab, tabOptions} from 'tab'
import {type} from 'type'
import {typeOptions} from 'type/typeImplementation'
import {upload, uploadOptions} from 'upload'
import {PointerOptions} from 'utils'

export const userEventApis = {
  clear,
  click,
  dblClick,
  deselectOptions,
  hover,
  keyboard,
  paste,
  selectOptions,
  tab,
  type,
  unhover,
  upload,
}
export type UserEventApis = typeof userEventApis

type ClickOptions = Omit<clickOptions, 'clickCount'>

type KeyboardOptions = Partial<keyboardOptions>

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
    TabOptions,
    TypeOptions,
    UploadOptions {}

/**
 * Start a "session" with userEvent.
 * All APIs returned by this function share an input device state and a default configuration.
 */
export function setup(options: SetupOptions = {}) {
  // TODO: prepare our document state workarounds

  return _setup(options, {
    keyboardState: createKeyboardState(),
  })
}

function _setup(
  {
    applyAccept,
    autoModify,
    delay,
    document,
    focusTrap,
    keyboardMap,
    skipAutoClose,
    skipClick,
    skipHover,
    skipPointerEventsCheck = false,
  }: SetupOptions,
  {
    keyboardState,
  }: {
    keyboardState: keyboardState
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

  return {
    clear,

    click: (...args: Parameters<typeof click>) => {
      args[2] = {...pointerDefaults, ...clickDefaults, ...args[2]}
      return click(...args)
    },

    dblClick: (...args: Parameters<typeof dblClick>) => {
      args[2] = {...pointerDefaults, ...clickDefaults, ...args[2]}
      return dblClick(...args)
    },

    deselectOptions: (...args: Parameters<typeof deselectOptions>) => {
      args[3] = {...pointerDefaults, ...args[3]}
      return deselectOptions(...args)
    },

    hover: (...args: Parameters<typeof hover>) => {
      args[2] = {...pointerDefaults, ...args[2]}
      return hover(...args)
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
      return paste(...args)
    },

    selectOptions: (...args: Parameters<typeof selectOptions>) => {
      args[3] = {...pointerDefaults, ...args[3]}
      return selectOptions(...args)
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
        },
      )
    },

    tab: (...args: Parameters<typeof tab>) => {
      args[0] = {...tabDefaults, ...args[0]}
      return tab(...args)
    },

    // type needs typecasting because of the overloading
    type: ((...args: Parameters<typeof type>) => {
      args[2] = {...typeDefaults, ...args[2]}
      return type(...args)
    }) as typeof type,

    unhover: (...args: Parameters<typeof unhover>) => {
      args[2] = {...pointerDefaults, ...args[2]}
      return unhover(...args)
    },

    upload: (...args: Parameters<typeof upload>) => {
      args[3] = {...uploadDefaults, ...args[3]}
      return upload(...args)
    },
  }
}
