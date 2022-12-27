import './modules/mocks.js'
import './modules/timers.js'
import './modules/testinglibrary.js'
import './modules/console.js'

import { toMatchInlineSnapshot } from 'jest-snapshot'

expect.extend({
    toMatchInlineSnapshot: function(actual, ...args) {
        return toMatchInlineSnapshot.call(this, actual?.snapshot ?? actual, ...args)
    }
})
