<div align="center">
<h1>user-event</h1>

<a href="https://www.emojione.com/emoji/1f415">
  <img
    height="80"
    width="80"
    alt="dog"
    src="https://raw.githubusercontent.com/testing-library/user-event/master/other/dog.png"
  />
</a>

<p>Simulate user events for <a href="https://github.com/testing-library/react-testing-library">react-testing-library</a>.</p>

<br />
</div>

<hr />

[![Build Status](https://travis-ci.org/testing-library/user-event.svg?branch=master)](https://travis-ci.org/testing-library/user-event)
[![Maintainability](https://api.codeclimate.com/v1/badges/75f1ff4397e994c6004e/maintainability)](https://codeclimate.com/github/testing-library/user-event/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/75f1ff4397e994c6004e/test_coverage)](https://codeclimate.com/github/testing-library/user-event/test_coverage)
[![All Contributors](https://img.shields.io/badge/all_contributors-13-orange.svg?style=flat-square)](#contributors-)

## The problem

From
[testing-library/dom-testing-library#107](https://github.com/testing-library/dom-testing-library/issues/107):

> [...] it is becoming apparent the need to express user actions on a web page
> using a higher-level abstraction than `fireEvent`

## The solution

`user-event` tries to simulate the real events that would happen in the browser
as the user interacts with it. For example `userEvent.click(checkbox)` would
change the state of the checkbox.

**The library is still a work in progress and any help is appreciated.**

## Installation

With NPM:

```sh
npm install @testing-library/user-event --save-dev
```

With Yarn:

```sh
yarn add @testing-library/user-event --dev
```

Now simply import it in your tests:

```js
import userEvent from "@testing-library/user-event";

// or

var userEvent = require("@testing-library/user-event");
```

## API

### `click(element)`

Clicks `element`, depending on what `element` is it can have different side
effects.

```jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("click", () => {
  render(
    <div>
      <label htmlFor="checkbox">Check</label>
      <input id="checkbox" data-testid="checkbox" type="checkbox" />
    </div>
  );

  userEvent.click(screen.getByText("Check"));
  expect(screen.getByTestId("checkbox")).toHaveAttribute("checked", true);
});
```

You can also ctrlClick / shiftClick etc with

```js
userEvent.click(elem, { ctrlKey: true, shiftKey: true })
```

See the [`MouseEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent)
constructor documentation for more options.

### `dblClick(element)`

Clicks `element` twice, depending on what `element` is it can have different
side effects.

```jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("double click", () => {
  const onChange = jest.fn();
  render(<input type="checkbox" id="checkbox" onChange={onChange} />);
  const checkbox = screen.getByTestId("checkbox");
  userEvent.dblClick(checkbox);
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(checkbox).toHaveProperty("checked", false);
});
```

### `async type(element, text, [options])`

Writes `text` inside an `<input>` or a `<textarea>`.

```jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("type", async () => {
  render(<textarea data-testid="email" />);

  await userEvent.type(screen.getByTestId("email"), "Hello, World!");
  expect(screen.getByTestId("email")).toHaveAttribute("value", "Hello, World!");
});
```

If `options.allAtOnce` is `true`, `type` will write `text` at once rather than
one character at the time. `false` is the default value.

`options.delay` is the number of milliseconds that pass between two characters
are typed. By default it's 0. You can use this option if your component has a
different behavior for fast or slow users.

### clear(element)

Selects the text inside an `<input>` or `<textarea>` and deletes it.

```jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("clear", () => {
  render(<textarea data-testid="email" value="Hello, World!" />);

  userEvent.clear(screen.getByTestId("email"));
  expect(screen.getByTestId("email")).toHaveAttribute("value", "");
});
```

### `selectOptions(element, values)`

Selects the specified option(s) of a `<select>` or a `<select multiple>`
element.

```jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("selectOptions", () => {
  render(
    <select multiple data-testid="select-multiple">
      <option data-testid="val1" value="1">
        A
      </option>
      <option data-testid="val2" value="2">
        B
      </option>
      <option data-testid="val3" value="3">
        C
      </option>
    </select>
  );

  userEvent.selectOptions(screen.getByTestId("select-multiple"), ["1", "3"]);

  expect(screen.getByTestId("val1").selected).toBe(true);
  expect(screen.getByTestId("val2").selected).toBe(false);
  expect(screen.getByTestId("val3").selected).toBe(true);
});
```

The `values` parameter can be either an array of values or a singular scalar
value.

### `tab({shift, focusTrap})`

Fires a tab event changing the document.activeElement in the same way the
browser does.

Options:

- `shift` (default `false`) can be true or false to invert tab direction.
- `focusTrap` (default `document`) a container element to restrict the tabbing
  within.

> **A note about tab**:
> [jsdom does not support tabbing](https://github.com/jsdom/jsdom/issues/2102),
> so this feature is a way to enable tests to verify tabbing from the end user's
> perspective. However, this limitation in jsdom will mean that components like
> [focus-trap-react](https://github.com/davidtheclark/focus-trap-react) will not
> work with `userEvent.tab()` or jsdom. For that reason, the `focusTrap` option
> is available to let you ensure your user is restricted within a focus-trap.

```jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import userEvent from "@testing-library/user-event";

it("should cycle elements in document tab order", () => {
  render(
    <div>
      <input data-testid="element" type="checkbox" />
      <input data-testid="element" type="radio" />
      <input data-testid="element" type="number" />
    </div>
  );

  const [checkbox, radio, number] = screen.getAllByTestId("element");

  expect(document.body).toHaveFocus();

  userEvent.tab();

  expect(checkbox).toHaveFocus();

  userEvent.tab();

  expect(radio).toHaveFocus();

  userEvent.tab();

  expect(number).toHaveFocus();

  userEvent.tab();

  // cycle goes back to first element
  expect(checkbox).toHaveFocus();
});
```

## Contributors

Thanks goes to these wonderful people
([emoji key](https://github.com/all-contributors/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://twitter.com/Gpx"><img src="https://avatars0.githubusercontent.com/u/767959?v=4" width="100px;" alt=""/><br /><sub><b>Giorgio Polvara</b></sub></a><br /><a href="https://github.com/testing-library/user-event/issues?q=author%3AGpx" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/user-event/commits?author=Gpx" title="Code">💻</a> <a href="https://github.com/testing-library/user-event/commits?author=Gpx" title="Documentation">📖</a> <a href="#ideas-Gpx" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-Gpx" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/testing-library/user-event/pulls?q=is%3Apr+reviewed-by%3AGpx" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/testing-library/user-event/commits?author=Gpx" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/weyert"><img src="https://avatars3.githubusercontent.com/u/7049?v=4" width="100px;" alt=""/><br /><sub><b>Weyert de Boer</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=weyert" title="Code">💻</a> <a href="https://github.com/testing-library/user-event/commits?author=weyert" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/twhitbeck"><img src="https://avatars2.githubusercontent.com/u/762471?v=4" width="100px;" alt=""/><br /><sub><b>Tim Whitbeck</b></sub></a><br /><a href="https://github.com/testing-library/user-event/issues?q=author%3Atwhitbeck" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/user-event/commits?author=twhitbeck" title="Code">💻</a></td>
    <td align="center"><a href="https://michaeldeboey.be"><img src="https://avatars3.githubusercontent.com/u/6643991?v=4" width="100px;" alt=""/><br /><sub><b>Michaël De Boey</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=MichaelDeBoey" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/michaellasky"><img src="https://avatars2.githubusercontent.com/u/6646599?v=4" width="100px;" alt=""/><br /><sub><b>Michael Lasky</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=michaellasky" title="Code">💻</a> <a href="https://github.com/testing-library/user-event/commits?author=michaellasky" title="Documentation">📖</a> <a href="#ideas-michaellasky" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/shomalgan"><img src="https://avatars0.githubusercontent.com/u/2883620?v=4" width="100px;" alt=""/><br /><sub><b>Ahmad Esmaeilzadeh</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=shomalgan" title="Documentation">📖</a></td>
    <td align="center"><a href="https://calebeby.ml"><img src="https://avatars1.githubusercontent.com/u/13206945?v=4" width="100px;" alt=""/><br /><sub><b>Caleb Eby</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=calebeby" title="Code">💻</a> <a href="https://github.com/testing-library/user-event/issues?q=author%3Acalebeby" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/user-event/pulls?q=is%3Apr+reviewed-by%3Acalebeby" title="Reviewed Pull Requests">👀</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://afontcu.dev"><img src="https://avatars0.githubusercontent.com/u/9197791?v=4" width="100px;" alt=""/><br /><sub><b>Adrià Fontcuberta</b></sub></a><br /><a href="https://github.com/testing-library/user-event/issues?q=author%3Aafontcu" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/user-event/commits?author=afontcu" title="Tests">⚠️</a> <a href="https://github.com/testing-library/user-event/commits?author=afontcu" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/skywickenden"><img src="https://avatars2.githubusercontent.com/u/4930551?v=4" width="100px;" alt=""/><br /><sub><b>Sky Wickenden</b></sub></a><br /><a href="https://github.com/testing-library/user-event/issues?q=author%3Askywickenden" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/user-event/commits?author=skywickenden" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/bogdanbodnar"><img src="https://avatars2.githubusercontent.com/u/9034868?v=4" width="100px;" alt=""/><br /><sub><b>Bodnar Bogdan</b></sub></a><br /><a href="https://github.com/testing-library/user-event/issues?q=author%3Abogdanbodnar" title="Bug reports">🐛</a> <a href="https://github.com/testing-library/user-event/commits?author=bogdanbodnar" title="Code">💻</a></td>
    <td align="center"><a href="https://zach.website"><img src="https://avatars0.githubusercontent.com/u/1699281?v=4" width="100px;" alt=""/><br /><sub><b>Zach Perrault</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=zperrault" title="Documentation">📖</a></td>
    <td align="center"><a href="https://twitter.com/ryanastelly"><img src="https://avatars1.githubusercontent.com/u/4138357?v=4" width="100px;" alt=""/><br /><sub><b>Ryan Stelly</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=FLGMwt" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/benmonro"><img src="https://avatars3.githubusercontent.com/u/399236?v=4" width="100px;" alt=""/><br /><sub><b>Ben Monro</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=benmonro" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/GentlemanHal"><img src="https://avatars2.githubusercontent.com/u/415521?v=4" width="100px;" alt=""/><br /><sub><b>Christopher Martin</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=GentlemanHal" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://fullgallop.me"><img src="https://avatars0.githubusercontent.com/u/32252769?v=4" width="100px;" alt=""/><br /><sub><b>Yuancheng Wu</b></sub></a><br /><a href="https://github.com/testing-library/user-event/pulls?q=is%3Apr+reviewed-by%3AYuanchengWu" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/maheshjag"><img src="https://avatars0.githubusercontent.com/u/1705603?v=4" width="100px;" alt=""/><br /><sub><b>MJ</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=maheshjag" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/jmcriffey"><img src="https://avatars0.githubusercontent.com/u/2831294?v=4" width="100px;" alt=""/><br /><sub><b>Jeff McRiffey</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=jmcriffey" title="Code">💻</a> <a href="https://github.com/testing-library/user-event/commits?author=jmcriffey" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://jagascript.com"><img src="https://avatars0.githubusercontent.com/u/4562878?v=4" width="100px;" alt=""/><br /><sub><b>Jaga Santagostino</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=kandros" title="Code">💻</a> <a href="https://github.com/testing-library/user-event/commits?author=kandros" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://jordy.app"><img src="https://avatars3.githubusercontent.com/u/12712484?v=4" width="100px;" alt=""/><br /><sub><b>jordyvandomselaar</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=jordyvandomselaar" title="Code">💻</a> <a href="https://github.com/testing-library/user-event/commits?author=jordyvandomselaar" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://lyamkin.com"><img src="https://avatars2.githubusercontent.com/u/3854930?v=4" width="100px;" alt=""/><br /><sub><b>Ilya Lyamkin</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=ilyamkin" title="Code">💻</a> <a href="https://github.com/testing-library/user-event/commits?author=ilyamkin" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://todofullstack.com"><img src="https://avatars2.githubusercontent.com/u/4474353?v=4" width="100px;" alt=""/><br /><sub><b>Kenneth Luján Rosas</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=klujanrosas" title="Code">💻</a> <a href="https://github.com/testing-library/user-event/commits?author=klujanrosas" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://thejoemorgan.com"><img src="https://avatars1.githubusercontent.com/u/2388943?v=4" width="100px;" alt=""/><br /><sub><b>Joe Morgan</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=jsmapr1" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/wachunga"><img src="https://avatars0.githubusercontent.com/u/438545?v=4" width="100px;" alt=""/><br /><sub><b>David Hirtle</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=wachunga" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/bdh1011"><img src="https://avatars2.githubusercontent.com/u/8446067?v=4" width="100px;" alt=""/><br /><sub><b>whiteUnicorn</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=bdh1011" title="Code">💻</a></td>
    <td align="center"><a href="https://www.matej.snuderl.si/"><img src="https://avatars3.githubusercontent.com/u/8524109?v=4" width="100px;" alt=""/><br /><sub><b>Matej Šnuderl</b></sub></a><br /><a href="https://github.com/testing-library/user-event/pulls?q=is%3Apr+reviewed-by%3AMeemaw" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://pomb.us"><img src="https://avatars1.githubusercontent.com/u/1911623?v=4" width="100px;" alt=""/><br /><sub><b>Rodrigo Pombo</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=pomber" title="Code">💻</a></td>
    <td align="center"><a href="http://github.com/Raynos"><img src="https://avatars3.githubusercontent.com/u/479538?v=4" width="100px;" alt=""/><br /><sub><b>Jake Verbaten</b></sub></a><br /><a href="https://github.com/testing-library/user-event/commits?author=Raynos" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!
