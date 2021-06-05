# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2021-06-05

### ⚠️ Breaking Changes Possible ⚠️

This update includes a new `[credentials]` attribute that handles the requests `credentials` value. The default has been changed from "include" to "same-origin". This change was implemented as part of an ongoing process designed to updated Postie to follow the Fetch API spec. To fix any Postie requests that break because of this update simply add `credentails="include"` to the element.

### Added

- `[credentials]` attribute accepts: include, omit, or same-origin
- `[headers]` attribute ([#1](https://github.com/codewithkyle/postie/issues/1))
    - split key-value pairs using the `:` character
    - add several headers using the `;` character

### Fixed

- credentials defaulted to `include` when the spec defaults to `same-origin`

## [1.0.1] - 2021-04-09

### Fixed

- added support for `[request]` or `[method]` attributes

## [1.0.0] - 2021-04-08

### Added

- Postie Element Anatomy
- Request Method & Body Controls
- Response Handling
- Trigger Event Options
- AJAX Requests
- User Prompts
- Utility Features
    - Once
    - Prevent Disable
    - Allow Event Defaults
    - Status Reset Timer
- Custom Events
    - Success
    - Error
    - Update Intersection Observer

[unreleased]: https://github.com/codewithkyle/postie/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/codewithkyle/postie/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/codewithkyle/postie/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/codewithkyle/postie/releases/tag/v1.0.0
