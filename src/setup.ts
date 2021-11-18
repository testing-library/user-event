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
import {getDocumentFromNode} from './utils/misc/getDocumentFromNode'

const userEventApiImplementations = {
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
} as const

/** Which is the options parameter? */
const userEventApiOptionsParameter = {
  clear: undefined,
  click: 1,
  copy: 0,
  cut: 0,
  dblClick: 1,
  deselectOptions: 2,
  hover: 1,
  keyboard: 1,
  paste: 1,
  pointer: 1,
  selectOptions: 2,
  tab: 0,
  tripleClick: 1,
  type: 2,
  unhover: 1,
  upload: 3,
} as const

/** Which return values should be void when used per setup? */
const userEventApiVoidReturn = {
  keyboard,
  pointer,
}

type ApiImpl = typeof userEventApiImplementations
type ApiNames = keyof typeof userEventApiImplementations
type PromisedValue<T> = T extends Promise<unknown> ? T : Promise<T>
type AsyncApis = {
  [k in ApiNames]: (
    this: ThisType<ApiImpl[k]>,
    ...args: Parameters<ApiImpl[k]>
  ) => PromisedValue<ReturnType<ApiImpl[k]>>
}

export type UserEventApis = typeof userEventApiImplementations
export type UserEvent = typeof userEventDefault | ReturnType<typeof setup>

function setupDocument(node?: Node) {
  const doc =
    (node && getDocumentFromNode(node)) ??
    (global.document as Document | undefined)

  // Might be undefined in other environments
  /* istanbul ignore else */
  if (doc) {
    prepareDocument(doc)
  }

  return doc
}

/**
 * Start a "session" with userEvent.
 * All APIs returned by this function share an input device state and a default configuration.
 */
function setup(options: SetupOptions = {}) {
  setupDocument(options.document)

  const view = options.document?.defaultView ?? window
  attachClipboardStubToView(view)

  return _setup(options, {
    keyboardState: createKeyboardState(),
    pointerState: createPointerState(),
  })
}

function getDocumentFromOptions<K extends ApiNames>(
  api: K,
  args: Parameters<ApiImpl[K]>,
) {
  if (userEventApiOptionsParameter[api] !== undefined) {
    return (
      args[userEventApiOptionsParameter[api] as number] as
        | {document: Document}
        | undefined
    )?.document
  }
}

export const userEventDefault = {
  ...Object.fromEntries(
    Object.entries(userEventApiImplementations).map(([api, impl]) => {
      function func(
        this: ThisType<typeof impl>,
        ...args: Parameters<typeof impl>
      ) {
        setupDocument(
          args[0] instanceof Element
            ? args[0]
            : getDocumentFromOptions(api as ApiNames, args),
        )

        return (impl as (...a: unknown[]) => unknown).apply(this, args)
      }
      Object.defineProperty(func, 'name', {get: () => impl.name})

      return [api, func]
    }),
  ),
  setup,
} as typeof userEventApiImplementations & {setup: typeof setup}

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
    keyboardState = createKeyboardState(),
    pointerState = createPointerState(),
  }: {
    keyboardState: keyboardState
    pointerState: pointerState
  },
): AsyncApis & {
  /**
   * Create a set of callbacks with different default settings but the same state.
   */
  setup(options: SetupOptions): ReturnType<typeof _setup>
} {
  const defaultOptions = {
    applyAccept,
    autoModify,
    delay,
    skipAutoClose,
    skipClick,
    skipHover,
    skipPointerEventsCheck,
    writeToClipboard,
    keyboardMap,
    pointerMap,
  }
  const overwriteOptions = {
    document,
    keyboardState,
    pointerState,
  }

  return {
    ...Object.fromEntries(
      Object.entries(userEventApiImplementations).map(([api, impl]) => {
        function func(
          this: ThisType<typeof impl>,
          ...args: Parameters<typeof impl>
        ) {
          if (userEventApiOptionsParameter[api as ApiNames] !== undefined) {
            const i = userEventApiOptionsParameter[api as ApiNames] as number
            args[i] = {
              ...defaultOptions,
              ...(args[i] as {}),
              ...overwriteOptions,
            }
          }
          const ret = (impl as (...a: unknown[]) => unknown).apply(this, args)
          return (ret instanceof Promise ? ret : Promise.resolve(ret)).then(v =>
            api in userEventApiVoidReturn ? undefined : v,
          )
        }
        Object.defineProperty(func, 'name', {get: () => impl.name})

        return [api, func]
      }),
    ),
    setup: (options: SetupOptions) => {
      return _setup(
        {
          ...defaultOptions,
          ...options,
          ...overwriteOptions,
        },
        {
          keyboardState,
          pointerState,
        },
      )
    },
  } as AsyncApis & {setup: (options: SetupOptions) => ReturnType<typeof _setup>}
}
