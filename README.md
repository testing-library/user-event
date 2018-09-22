<div align="center">
<h1>user-event</h1>

<a href="https://www.emojione.com/emoji/1f415">
<img height="80" width="80" alt="dog" src="https://raw.githubusercontent.com/gpx/user-event/master/other/dog.png" />
</a>

<p>Simulate user events for <a href="https://github.com/kentcdodds/react-testing-library">react-testing-library</a></p>
</div>

<hr />

[![Build Status](https://travis-ci.org/Gpx/user-event.svg?branch=master)](https://travis-ci.org/Gpx/user-event)
[![Maintainability](https://api.codeclimate.com/v1/badges/75f1ff4397e994c6004e/maintainability)](https://codeclimate.com/github/Gpx/user-event/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/75f1ff4397e994c6004e/test_coverage)](https://codeclimate.com/github/Gpx/user-event/test_coverage)

## The problem

From
[kentcdodds/dom-testing-library#107](https://github.com/kentcdodds/dom-testing-library/issues/107):

> [...] it is becoming apparent the need to express user actions on a web page
> using a higher-level abstraction than `fireEvent`

## The solution

`user-event` tries to simulate the real events that would happen in the browser
as the user interacts with it. For example `userEvent.click(checkbox)` would
change the state of the checkbox.

The library is still a work in progress and any help is appreciated.
