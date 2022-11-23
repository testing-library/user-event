/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { withGlobal, } from '@sinonjs/fake-timers';
var FakeTimers = /** @class */ (function () {
    function FakeTimers(context) {
        if (context === void 0) { context = globalThis; }
        this.fakeTimers = withGlobal(context);
    }
    FakeTimers.prototype.clearAllTimers = function () {
        var _a;
        (_a = this.clock) === null || _a === void 0 ? void 0 : _a.reset();
    };
    FakeTimers.prototype.dispose = function () {
        this.useRealTimers();
    };
    FakeTimers.prototype.runAllTimers = function () {
        var _a;
        (_a = this.clock) === null || _a === void 0 ? void 0 : _a.runAll();
    };
    FakeTimers.prototype.runOnlyPendingTimers = function () {
        var _a;
        (_a = this.clock) === null || _a === void 0 ? void 0 : _a.runToLast();
    };
    FakeTimers.prototype.advanceTimersToNextTimer = function (steps) {
        if (steps === void 0) { steps = 1; }
        this.assertFakeTimers();
        for (var i = steps; i > 0; i--) {
            this.clock.next();
            // Fire all timers at this point: https://github.com/sinonjs/fake-timers/issues/250
            this.clock.tick(0);
            if (this.clock.countTimers() === 0) {
                break;
            }
        }
    };
    FakeTimers.prototype.advanceTimersByTime = function (msToRun) {
        this.assertFakeTimers();
        this.clock.tick(msToRun);
    };
    FakeTimers.prototype.runAllTicks = function () {
        this.assertFakeTimers();
        // @ts-expect-error - doesn't exist?
        this.clock.runMicrotasks();
    };
    FakeTimers.prototype.useRealTimers = function () {
        var _a;
        (_a = this.clock) === null || _a === void 0 ? void 0 : _a.uninstall();
        delete this.clock;
    };
    FakeTimers.prototype.useFakeTimers = function (fakeTimersConfig) {
        if (this.clock) {
            this.clock.uninstall();
            delete this.clock;
        }
        this.clock = this.fakeTimers.install(fakeTimersConfig);
    };
    FakeTimers.prototype.reset = function () {
        this.assertFakeTimers();
        var now = this.clock.now;
        this.clock.reset();
        this.clock.setSystemTime(now);
    };
    FakeTimers.prototype.setSystemTime = function (now) {
        this.assertFakeTimers();
        this.clock.setSystemTime(now);
    };
    FakeTimers.prototype.getRealSystemTime = function () {
        return Date.now();
    };
    FakeTimers.prototype.now = function () {
        var _a, _b;
        return (_b = (_a = this.clock) === null || _a === void 0 ? void 0 : _a.now) !== null && _b !== void 0 ? _b : Date.now();
    };
    FakeTimers.prototype.getTimerCount = function () {
        this.assertFakeTimers();
        return this.clock.countTimers();
    };
    FakeTimers.prototype.assertFakeTimers = function () {
        if (!this.clock) {
            throw new Error('A function that relies on fake timers was called, but the timers APIs are not replaced with fake timers.');
        }
    };
    return FakeTimers;
}());
export { FakeTimers };
