# Gameboy DMG-001 (HTML/CSS/JS)

A static, pixel-accurate-ish recreation of the original Nintendo Game Boy (DMG-001) shell using pure HTML, CSS, and a small bit of JavaScript for the power toggle + boot animation.

## Features
- Power toggle with battery light + display on/off state
- Nintendo logo boot animation
- Fully static layout (no build step)

## Tech Stack
- HTML + CSS + vanilla JavaScript
- CDN assets: Bootstrap 4, Font Awesome, Google Fonts

## Run Locally
1. Open `index.html` in a browser.

If you want a local server for consistent asset loading:
```
python3 -m http.server 8000
```
Then visit `http://localhost:8000`.

## Project Structure
- `index.html` - Markup for the Game Boy shell
- `appname.css` - Styling and layout
- `appname.js` - Power toggle + boot animation
- `img/` - Image assets used by the display

## Notes
- Fonts and icons are loaded from CDNs; you will need a network connection for those resources.

## License
No license specified. If you want this to be open-source, add a license file (MIT/Apache-2.0 are common choices).
