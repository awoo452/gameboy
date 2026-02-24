# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

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
