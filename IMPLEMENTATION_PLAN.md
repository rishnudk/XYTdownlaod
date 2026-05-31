# X & YouTube Media Downloader Extension

## Project Overview

Build a developer-mode Chrome Extension using:

* React
* TypeScript
* Vite
* TailwindCSS
* shadcn/ui
* Manifest V3

The extension should allow downloading media from:

* X (Twitter)
* YouTube

This extension is for personal use and will not be published to the Chrome Web Store.

---

# Features

## X (Twitter)

### MVP

* Download photos
* Download videos
* Download GIFs
* Download profile pictures

### Advanced

* Download all media from a tweet
* Select video quality
* Download entire thread media
* Custom filename formatting
* Download history

---

## YouTube

### MVP

* Download video
* Download audio
* Download thumbnail

### Advanced

* Quality selector
* Playlist support
* Download subtitles
* Download chapters
* Download channel thumbnails

---

# Technical Stack

## Frontend

* React
* TypeScript
* TailwindCSS
* shadcn/ui

## Extension

* Manifest V3
* Content Scripts
* Background Service Worker
* Chrome Downloads API
* Chrome Storage API

## Build Tool

* Vite

---

# Folder Structure

```txt
x-media-downloader/

public/
│
├── manifest.json
│
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png

src/

├── background/
│   ├── index.ts
│   ├── downloadManager.ts
│   ├── storageManager.ts
│   ├── networkInterceptor.ts
│   ├── messageRouter.ts
│   └── queueManager.ts
│
├── content/
│
│   ├── twitter/
│   │   ├── index.ts
│   │   ├── tweetScanner.ts
│   │   ├── mediaExtractor.ts
│   │   ├── buttonInjector.ts
│   │   ├── videoParser.ts
│   │   └── photoParser.ts
│   │
│   ├── youtube/
│   │   ├── index.ts
│   │   ├── pageScanner.ts
│   │   ├── streamExtractor.ts
│   │   ├── buttonInjector.ts
│   │   └── videoParser.ts
│   │
│   └── shared/
│       ├── dom.ts
│       ├── observer.ts
│       ├── messaging.ts
│       └── helpers.ts
│
├── popup/
│
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Downloads.tsx
│   │   ├── Settings.tsx
│   │   ├── History.tsx
│   │   └── About.tsx
│   │
│   ├── components/
│   │   ├── DownloadCard.tsx
│   │   ├── MediaPreview.tsx
│   │   ├── QualitySelector.tsx
│   │   ├── DownloadProgress.tsx
│   │   └── StatusBadge.tsx
│   │
│   ├── hooks/
│   │   ├── useDownloads.ts
│   │   └── useStorage.ts
│   │
│   └── App.tsx
│
├── services/
│
│   ├── twitter/
│   │   ├── twitterVideo.ts
│   │   ├── twitterPhoto.ts
│   │   └── twitterGif.ts
│   │
│   ├── youtube/
│   │   ├── youtubeVideo.ts
│   │   ├── youtubeAudio.ts
│   │   ├── youtubeThumbnail.ts
│   │   └── youtubeManifest.ts
│   │
│   └── downloader/
│       ├── downloader.ts
│       ├── fileSaver.ts
│       ├── filenameGenerator.ts
│       └── qualityResolver.ts
│
├── types/
│   ├── media.ts
│   ├── twitter.ts
│   ├── youtube.ts
│   ├── messages.ts
│   └── downloads.ts
│
├── utils/
│   ├── logger.ts
│   ├── validators.ts
│   ├── constants.ts
│   └── formatters.ts
│
├── main.ts

package.json
vite.config.ts
tsconfig.json
README.md
```

---

# Architecture

## Content Scripts

Responsible for:

* Detecting supported pages
* Scanning media
* Injecting download buttons
* Sending media information to background worker

---

## Background Worker

Responsible for:

* Managing downloads
* Receiving messages
* Handling queues
* Persisting history
* Storage management

---

## Popup

Responsible for:

* Displaying downloads
* Managing settings
* Showing history
* Selecting default quality

---

# Manifest Configuration

```json
{
  "manifest_version": 3,
  "name": "Media Downloader",
  "version": "1.0.0",

  "permissions": [
    "downloads",
    "storage",
    "tabs",
    "activeTab",
    "scripting"
  ],

  "host_permissions": [
    "https://twitter.com/*",
    "https://x.com/*",
    "https://www.youtube.com/*"
  ],

  "background": {
    "service_worker": "background.js"
  },

  "action": {
    "default_popup": "index.html"
  }
}
```

---

# Database Strategy

No backend required.

Use:

```typescript
chrome.storage.local
```

Structure:

```typescript
{
  settings: {
    defaultQuality: "1080p",
    autoDownload: false,
    fileNamingPattern: "{username}_{timestamp}"
  },

  history: [],

  downloads: []
}
```

---

# Development Phases

## Phase 1

### Twitter Photos

Workflow:

```txt
Tweet Detected
↓
Extract Image URL
↓
Inject Download Button
↓
Download Original Image
```

Deliverable:

* Download photo

---

## Phase 2

### Twitter Videos

Workflow:

```txt
Tweet Detected
↓
Video Found
↓
Find Video Manifest
↓
Parse Available Qualities
↓
Download Selected Quality
```

Deliverable:

* Download video
* Download GIF

---

## Phase 3

### Download All Media

Workflow:

```txt
Tweet
├── Image 1
├── Image 2
├── Image 3
└── Video

Download All
```

Deliverable:

* Batch download

---

## Phase 4

### YouTube Support

Workflow:

```txt
Video Page
↓
Extract Metadata
↓
Extract Streams
↓
Choose Quality
↓
Download
```

Deliverable:

* Download video
* Download audio
* Download thumbnail

---

## Phase 5

### Download Manager

Features:

* Pause
* Resume
* Retry
* Progress tracking
* Download queue

---

# UI Pages

## Home

Shows:

* Current site
* Detected media
* Quick download buttons

---

## Downloads

Shows:

* Active downloads
* Progress
* Status

---

## History

Shows:

* Previously downloaded files

---

## Settings

Settings:

* Default quality
* File naming pattern
* Download location
* Auto download

---

# TypeScript Interfaces

```typescript
export interface MediaItem {
  id: string;
  type: "image" | "video" | "audio";
  source: "twitter" | "youtube";
  url: string;
  thumbnail?: string;
  qualities?: MediaQuality[];
}

export interface MediaQuality {
  label: string;
  url: string;
}

export interface DownloadTask {
  id: string;
  mediaId: string;
  status: "pending" | "downloading" | "completed" | "failed";
  progress: number;
}
```

---

# AI IDE Instructions

Build the complete project using:

* React
* TypeScript
* Vite
* TailwindCSS
* shadcn/ui
* Manifest V3

Requirements:

1. Generate complete folder structure.
2. Configure Vite for Chrome Extension development.
3. Create manifest.json.
4. Configure TailwindCSS.
5. Configure shadcn/ui.
6. Create content scripts.
7. Create background worker.
8. Create popup UI.
9. Create download manager.
10. Create message passing architecture.
11. Create strict TypeScript types.
12. Use scalable clean architecture.
13. Follow feature-based folder organization.
14. Add ESLint and Prettier.
15. Create production-ready codebase.

Goal:

Create a fully functional developer-mode media downloader extension with a scalable architecture suitable for future support of Instagram, Reddit, TikTok, and Pinterest.
