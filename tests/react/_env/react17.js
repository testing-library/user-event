// eslint-disable-next-line import/no-extraneous-dependencies
const {TestEnvironment} = require('jest-environment-jsdom')

module.exports = class React17 extends TestEnvironment {
  async setup() {
    await super.setup()
    this.global.REACT_VERSION = 17
  }
}
