# Gameboy DMG-001 (HTML/CSS/JS)

A static, pixel-accurate-ish recreation of the original Nintendo Game Boy (DMG-001) shell using pure HTML, CSS, and a small bit of JavaScript for the power toggle + boot animation.

## Features
- Power toggle with battery light + display on/off state
- Nintendo logo boot animation
- Fully static layout (no build step)
- Hidden dev menu for testing API error states

## Tech Stack
- HTML + CSS + vanilla JavaScript
- CDN assets: Google Fonts

## Run Locally
1. Open `index.html` in a browser.

If you want a local server for consistent asset loading:
```
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

## Project Structure
- `index.html` - Markup for the Game Boy shell
- `gameboy.css` - Styling and layout
- `gameboy.js` - Power toggle + boot animation
- `img/` - Image assets used by the display

## Notes
- Fonts are loaded from Google Fonts; you will need a network connection for those resources.
- The LCD is rendered at the original 160x144 resolution, with the shell scaled to fit the viewport.
- Navigation is intentionally D-pad/keyboard only (no touchscreen input).
- API calls to `/pokemon/random` persist by default. To make stateless calls, pass `persist: false` in `fetchRandomPokemon` or append `persist=false` to the request.

## Dev Menu
The dev menu is hidden by default.
- Unlock sequence (D-pad): 42069 (figure it out)
- Once unlocked, a DEV item appears in the main menu. Use A/Start to open it.
- Requests made under this menu are sent with `persist=false` to avoid db clutter in the Pokemon API
Actions:
- RATE LIMIT fires rapid requests to surface 429 errors.
- TIMEOUT forces a rapid request timeout to surface GB-002.
- NOT FOUND hits a missing endpoint to surface GB-003.

## License
All rights reserved. See `LICENSE`.
