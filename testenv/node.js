import './modules/expect.js'
import './modules/mocks.js'
import './modules/timers.js'
import './modules/testinglibrary.js'
import './modules/inlineSnapshot.js'
import './modules/console.js'

import 'css.escape'
import {JSDOM} from 'jsdom'

const jsdom = new JSDOM()
globalThis.navigator = jsdom.window.navigator
globalThis.window = jsdom.window
globalThis.document = jsdom.window.document

globalThis.window.CSS = {
  escape: global.CSS.escape,
}

globalThis.XPathResult = jsdom.window.XPathResult
globalThis.File = jsdom.window.File
globalThis.DOMParser = jsdom.window.DOMParser
globalThis.Blob = jsdom.window.Blob
globalThis.FileReader = jsdom.window.FileReader
globalThis.FileList = jsdom.window.FileList
globalThis.customElements = jsdom.window.customElements
