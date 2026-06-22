# XYTdownloader

A developer-mode Chrome Extension built for downloading media from X (Twitter), Pinterest, Dribbble, and YouTube.

## Features

- **X (Twitter):** Detects tweets and adds a direct download button over images to fetch the highest available quality, saved as PNG.
- **Pinterest:** Adds a download button to pin images and converts them to PNG before saving.
- **Dribbble:** Adds a download button to shot images and converts them to PNG before saving.
- **YouTube:** Download videos, audio, and thumbnails.

## Output

- Image downloads are normalized to `.png` output where supported.
- Video downloads keep their original media format.

## Tech Stack

- **Framework:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS (v4) + shadcn/ui
- **Architecture:** Chrome Extension Manifest V3 (Service Worker, Content Scripts)

## Installation (Developer Mode)

Since this extension is for personal use and is not published on the Chrome Web Store, you will need to load it manually:

1. Clone or download this repository.
2. Ensure you have [Node.js](https://nodejs.org/) installed.
3. Install dependencies and build the extension:
   ```bash
   npm install
   npm run build
   ```
4. Open Google Chrome and navigate to `chrome://extensions/`.
5. Enable **Developer mode** using the toggle in the top right corner.
6. Click the **Load unpacked** button and select the `dist` folder located inside the project directory.

## Development

To watch for file changes and rebuild automatically during development:

```bash
npm run build -- --watch
```
*(Note: You will still need to reload the extension in `chrome://extensions/` or refresh the page for content scripts to reflect updates.)*
