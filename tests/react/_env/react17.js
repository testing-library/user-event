// eslint-disable-next-line import/no-extraneous-dependencies
const jsdomEnv = require('jest-environment-jsdom')

module.exports = class React17 extends jsdomEnv {
  async setup() {
    await super.setup()
    this.global.REACT_VERSION = 17
  }
}
