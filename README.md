<div align="center">
<h1>user-event</h1>

<a href="https://www.joypixels.com/profiles/emoji/1f415">
  <img
    height="80"
    width="80"
    alt="dog"
    src="https://raw.githubusercontent.com/testing-library/user-event/main/other/dog.png"
  />
</a>

<p>Fire events the same way the user does</p>

<br />

[**Read The Docs**](https://testing-library.com/docs/user-event/intro)

<br />
</div>

---

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npmtrends]
[![MIT License][license-badge]][license]
[![All Contributors][all-contributors-badge]](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Code of Conduct][coc-badge]][coc]
[![Discord][discord-badge]][discord]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]
<!-- prettier-ignore-end -->

## The problem

From
[testing-library/dom-testing-library#107](https://github.com/testing-library/dom-testing-library/issues/107):

> [...] it is becoming apparent the need to express user actions on a web page
> using a higher-level abstraction than [`fireEvent`][fire-event]

## The solution

`user-event` tries to simulate the real events that would happen in the browser
as the user interacts with it. For example `userEvent.click(checkbox)` would
change the state of the checkbox.

> [The more your tests resemble the way your software is used, the more
> confidence they can give you.][guiding-principle]

## Issues

Looking to contribute? Look for the [Good First Issue][good-first-issue] label.

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding
a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][requests]

### ❓ Questions

For questions related to using the library, please visit a support community
instead of filing an issue on GitHub.

- [Discord][discord]
- [Stack Overflow][stackoverflow]

## Contributors

We most sincerely thank [the people who make this project
possible][contributors]. Contributions of any kind are welcome! 💚

## License

[MIT](LICENSE)

<!-- prettier-ignore-start -->
[npm]: https://www.npmjs.com
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/github/workflow/status/testing-library/user-event/validate/main?logo=github&style=flat-square
[build]: https://github.com/testing-library/user-event/actions?query=workflow%3Avalidate
[coverage-badge]: https://img.shields.io/codecov/c/github/testing-library/user-event.svg?style=flat-square
[coverage]: https://codecov.io/github/testing-library/user-event
[version-badge]: https://img.shields.io/npm/v/@testing-library/user-event.svg?style=flat-square
[package]: https://www.npmjs.com/package/@testing-library/user-event
[downloads-badge]: https://img.shields.io/npm/dm/@testing-library/user-event.svg?style=flat-square
[npmtrends]: http://www.npmtrends.com/@testing-library/user-event
[license-badge]: https://img.shields.io/npm/l/@testing-library/user-event.svg?style=flat-square
[license]: https://github.com/testing-library/user-event/blob/main/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/testing-library/.github/blob/main/CODE_OF_CONDUCT.md
[github-watch-badge]: https://img.shields.io/github/watchers/testing-library/user-event.svg?style=social
[github-watch]: https://github.com/testing-library/user-event/watchers
[github-star-badge]: https://img.shields.io/github/stars/testing-library/user-event.svg?style=social
[github-star]: https://github.com/testing-library/user-event/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20user-event%20by%20%40@TestingLib%20https%3A%2F%2Fgithub.com%2Ftesting-library%2Fuser-event%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/testing-library/user-event.svg?style=social
[all-contributors-badge]: https://img.shields.io/github/all-contributors/testing-library/user-event?color=orange&style=flat-square
[guiding-principle]: https://twitter.com/kentcdodds/status/977018512689455106
[bugs]: https://github.com/testing-library/user-event/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Acreated-desc+label%3Abug
[requests]: https://github.com/testing-library/user-event/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement
[good-first-issue]: https://github.com/testing-library/user-event/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement+label%3A%22good+first+issue%22
[fire-event]: https://testing-library.com/docs/dom-testing-library/api-events#fireevent
[discord-badge]: https://img.shields.io/discord/723559267868737556.svg?color=7389D8&labelColor=6A7EC2&logo=discord&logoColor=ffffff&style=flat-square
[discord]: https://discord.gg/testing-library
[stackoverflow]: https://stackoverflow.com/questions/tagged/user-event
[contributors]: https://github.com/testing-library/user-event/blob/beta/CONTRIBUTORS.md
<!-- prettier-ignore-end -->
