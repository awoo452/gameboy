# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.0.14] - 2026-02-26
### Changed
- README.md is differenter than it used to be.0

## [0.0.13] - 2026-02-26
### Changed
- Only send `persist=false` when explicitly requested; default API calls now allow persistence.

## [0.0.12] - 2026-02-24
### Changed
- Label the Error Codes link as "Docs" to match in-app messaging.
- Document the API rate limit in the docs page.

## [0.0.11] - 2026-02-24
### Added
- "Fetch Original" menu option to limit results to the original 151.

### Changed
- Random fetch now supports `range=original` against the Pokemon API.

## [0.0.10] - 2026-02-24
### Added
- Error codes documentation page with troubleshooting steps.
- Footer link to Error Codes in the app and legal pages.

### Changed
- Display error codes with a “Visit docs to troubleshoot” prompt on failures.
- Log error-code failures to the console with metadata.

## [0.0.9] - 2026-02-24
### Changed
- Show clearer error messages when the API call fails.

## [0.0.8] - 2026-02-24
### Changed
- CORS can go fuck itself, respectfully

## [0.0.7] - 2026-02-24
### Changed
- Removed the boot-time API warm-up call.
- Kept status text at FETCHING during retries; no more RETRYING status.

## [0.0.6] - 2026-02-24
### Changed
- Reduced noisy retry status by extending request timeout and silencing warm-up retries.
- Removed the Clear option from the Pokedex menu and its handler.

## [0.0.5] - 2026-02-23
### Added
- Boot-time navigation menu with a Pokedex entry point.
- Clear option to reset Pokemon details.

### Changed
- Menu navigation is now driven by D-pad and A/Start (screen items are no longer clickable).

## [0.0.4] - 2026-02-23
### Added
- In-screen Pokedex menu UI with period-correct pixel font styling.
- Live API fetch for random Pokemon with on-screen rendering of basic stats.
- Meta-configurable API base URL for deployment flexibility.
- D-pad, A/Start, and B button handling plus keyboard support.

### Changed
- Boot sequence now transitions into the menu after the Nintendo logo drop.

## [0.0.3] - 2026-02-22
### Added
- Terms of Use and Privacy Policy pages.
- Footer links to legal pages.
- LICENSE file.
- `.gitignore` to ignore temp artifacts.

## [0.0.2] - 2026-02-21
### Changed / Removed
- Remove unused CSS selectors/variables and drop unused font import.

## [0.0.1] - 2026-02-21
### Changed
- Use event listener for the power switch and guard/clear boot timers.
- Remove unused JS CDN scripts.
- Add accessibility labels and restore focus outlines.

### Added
- Readme and Changelog

## [Unreleased]
### Added
- Initial Game Boy DMG-001 static layout.
- Power toggle with battery light and display state.
- Nintendo logo boot animation.
