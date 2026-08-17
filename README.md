# Evergreen 🌿

Evergreen is a personal memory and relationship web application built to make shared moments feel like a living digital space rather than a traditional photo gallery.

The project combines a modern Next.js interface with Firebase/Firestore data management, Google Drive media storage, Google OAuth, and server-side media delivery. It includes an administrative memory manager for organizing albums and media while presenting the same memories through a polished public-facing experience.

> **Project status:** Active personal project. The core application is functional and deployed, while media playback and streaming behavior continue to be refined.

## ✨ Highlights

- 📸 **Memory albums** — Create, edit, and organize albums with covers and media.
- 🎞️ **Photo & video support** — Store images and videos in Google Drive while keeping album metadata in Firestore.
- ☁️ **Google Drive integration** — Upload and retrieve album media through the Google Drive API.
- 🔐 **Google OAuth** — Server-side OAuth flow with state validation and secure HTTP-only cookies.
- 🗂️ **Custom memory CMS** — Administrative tools for creating albums, uploading media, renaming albums, and deleting content.
- ▶️ **Range-based media delivery** — The application supports HTTP byte-range requests so browsers can stream and seek large video files without downloading the entire file at once.
- 🎬 **MOV processing** — iPhone/QuickTime MOV uploads can be prepared as MP4 files using FFmpeg without re-encoding the video stream.
- 📱 **Responsive UI** — Designed for desktop and mobile experiences.
- ✨ **Animated interface** — Uses Framer Motion for transitions and interactive UI details.
- 🎵 **Soundtrack experience** — Includes a dedicated soundtrack section for the relationship experience.

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| **Next.js 16** | Full-stack React framework and application routing |
| **React 19** | UI development |
| **TypeScript** | Type-safe application development |
| **Tailwind CSS 4** | Styling and responsive UI |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Interface icons |
| **Firebase** | Application data and Firestore integration |
| **Google Drive API** | Cloud media storage |
| **Google OAuth 2.0** | Google account authorization |
| **FFmpeg** | MOV → MP4 media preparation |
| **Vercel** | Production deployment |

## 🏗️ Architecture

Evergreen separates application metadata from large media assets:

```text
                        ┌─────────────────────┐
                        │      Next.js App     │
                        │   React + TypeScript │
                        └──────────┬──────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  │                │                │
                  ▼                ▼                ▼
           ┌────────────┐   ┌──────────────┐  ┌─────────────┐
           │ Firestore  │   │ Google OAuth │  │ Google Drive│
           │ Album Data │   │ Authorization│  │ Media Files │
           └────────────┘   └──────────────┘  └─────────────┘
                                   │                │
                                   └───────┬────────┘
                                           ▼
                                ┌────────────────────┐
                                │ Next.js API Routes │
                                │ Media / Upload /   │
                                │ Authentication     │
                                └────────────────────┘
```

### Data model

Firestore stores the application's album structure and references to media. Google Drive stores the actual photo and video files.

This keeps large binary media out of Firestore while allowing the application to maintain an organized album model.

### Media streaming

Public media is served through:

```text
/api/memories/files/[fileId]
```

The route retrieves file metadata from Google Drive and handles browser `Range` requests. This allows a `<video>` element to request specific byte ranges and receive `206 Partial Content` responses.

## 🎬 Video Processing

Some iPhone MOV files can behave differently from MP4 files when delivered through a custom streaming route. Evergreen therefore includes an FFmpeg-based preparation step for MOV uploads.

The current processing path uses stream copying rather than video transcoding:

```text
MOV
 │
 ▼
FFmpeg
 │  -c:v copy
 │  -c:a copy
 │  +faststart
 ▼
MP4
```

The intention is to preserve the original video and audio codecs, resolution, frame rate, and quality while changing the container and optimizing MP4 metadata placement.

Media playback remains an active area of development because browser behavior can differ between the original Drive-hosted playback path and Evergreen's custom byte-range streaming path.

## 🔐 Security & Privacy

Evergreen is designed around private personal media, so credentials and application secrets are intentionally kept outside the repository.

Environment variables are used for sensitive configuration such as:

- Firebase configuration
- Google OAuth client credentials
- Google Drive authentication configuration
- Production-specific values

The repository's `.gitignore` excludes environment files, private key files, generated build output, dependencies, and large local media files.

**Do not commit `.env.local`, OAuth client secrets, refresh tokens, private keys, or personal media.**

For production use, credentials should be stored in the hosting provider's environment-variable/secret-management system rather than committed to source control.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Firebase project
- A Google Cloud project with the required Google Drive API and OAuth configuration
- A Google OAuth client for the application's callback URL

### Installation

Clone the repository:

```bash
git clone https://github.com/emmldbln/evergreen.git
cd evergreen
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
.env.local
```

Configure the required Firebase and Google OAuth environment variables according to the application's server/client configuration.

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## 📁 Project Structure

```text
app/
├── admin/                 # Administrative memory management
├── api/
│   ├── auth/              # Google OAuth routes
│   └── memories/          # Album, upload, deletion and media APIs
├── components/            # Reusable UI components
├── memories/              # Public memory experience
├── settings/              # Settings and memory management UI
└── page.tsx               # Main application entry

lib/
├── firestore/             # Firestore data access
├── google-drive.ts        # Google Drive integration
└── video-conversion.ts    # FFmpeg media preparation
```

## 🧠 Engineering Challenges

### 1. Large video delivery

Serving large videos through an application server requires more than returning the file contents. Browsers use byte-range requests for seeking and progressive playback, so Evergreen implements range-aware responses and forwards the requested byte ranges to Google Drive.

### 2. Cloud storage vs. application data

Photos and videos can become very large, while album metadata is comparatively small. Evergreen separates these concerns by using Firestore for structured metadata and Google Drive for the binary media.

### 3. OAuth lifecycle

Google Drive access requires a persistent authorization flow. Evergreen uses OAuth state validation and stores the resulting refresh token in an HTTP-only cookie rather than placing credentials in client-side source code.

### 4. iPhone video compatibility

MOV files produced by Apple devices can contain media/container characteristics that behave differently across browsers and streaming implementations. Evergreen uses FFmpeg-based container preparation for MOV uploads while avoiding unnecessary video transcoding.

## 📌 Current Limitations

- Media playback through the custom streaming endpoint is still being optimized for some large videos and audio streams.
- The application is primarily designed as a personal/private relationship application rather than a general-purpose social platform.
- A complete public deployment requires the correct Firebase, Google OAuth, Google Drive, and production environment configuration.

## 🌱 Why Evergreen?

The goal of Evergreen is simple: build a digital place where shared memories feel personal, organized, and alive.

It started as a relationship-focused project and evolved into a full-stack application involving authentication, cloud storage, database design, media processing, streaming, responsive UI, and deployment.

## 📄 License

This project is currently intended as a personal portfolio project. A formal open-source license has not yet been selected.

## 👤 Author

**Emman De Belen**

Electronics Engineering graduate and software-focused developer interested in full-stack development, cloud integrations, automation, and applied AI.

- GitHub: [@emmldbln](https://github.com/emmldbln)
- Project: [Evergreen](https://github.com/emmldbln/evergreen)
