# Coy Discover

A modern, polished, dating-style discovery experience inspired by Tinder and Bumble, built with **React**, **Vite**, **Express**, and resilient JSON persistence.

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![Tests](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen.svg)](#4-run-automated-test-suite)

---

## 📑 Table of Contents

- [🌟 Key Features](#-key-features)
- [📋 System Requirements](#-system-requirements)
- [🚀 Quick Start](#-quick-start)
- [🎮 How to Test the Demo](#-how-to-test-the-demo)
- [🔌 API Endpoints Reference](#-api-endpoints-reference)
- [🏗 Architecture & Code Structure](#-architecture--code-structure)
- [💡 Improvements Summary](#-improvements-summary)
- [📌 Remaining Limitations & Future Work](#-remaining-limitations--future-work)

---

## 🌟 Key Features

- **One Profile at a Time**: Smooth, distraction-free discovery feed showcasing curated profiles with high-resolution photos, location, bios, and interest tags.
- **Natural Touch & Mouse Drag Physics**: Smooth card swiping with live rotation, interactive dynamic stamps (`LIKE` and `PASS`), and smooth card exit transitions.
- **Tactile Button Controls**: Pass (Left) and Like (Right) buttons with pressed states, keyboard shortcuts (`←` and `→`), and matching fly-off animations.
- **Card Stack Peeking**: The upcoming profile subtly scales up and fades in beneath the active card as you drag.
- **Mutual-Only Match System**: Matches occur **only** when both sides have liked each other. Incoming likes are strictly kept private server-side and never exposed to the public feed API.
- **Celebratory Match Modal**: Beautiful full-screen celebration with confetti particles, dual interlocking avatars, and quick action buttons when a mutual match occurs.
- **Dedicated Matches Section**: Rich gallery displaying mutual connections with quick-chat prompts and an expandable match detail modal.
- **Intentional Blank Home Tab**: Conforms strictly to the assignment requirement keeping the Home tab blank.
- **Mobile-First Responsive Layout**: Features a mobile bottom navigation bar with active badges, as well as a desktop layout with side context cards and keyboard shortcuts.
- **Robust Persistence & Concurrency**: Swipes and matches persist in `server/data/state.json`. Swiped profiles never reappear upon reload. Concurrency-safe state writes prevent race conditions.
- **One-Click Demo Reset**: Reset the demo anytime directly from the UI or via `POST /reset` without needing to delete files manually.

---

## 📋 System Requirements

- **Node.js**: `v18.0.0+` (Tested on Node.js v20+ and v24)
- **Package Manager**: `npm v9+`
- **Operating System**: Windows (PowerShell / Command Prompt), macOS, or Linux

---

## 🚀 Quick Start

### 1. Clone & Enter Project Directory

```bash
git clone <repository-url>
cd coy-discover
```

### 2. Install Dependencies

Install root, client, and server dependencies in one command:

```bash
npm install
```

### 3. Run Development Environment

Starts both the Express API server and the Vite React frontend concurrently:

```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:4000](http://localhost:4000) *(with automatic fallback to port `4001` if port `4000` is reserved by Windows Hyper-V/NAT)*

### 4. Run Automated Test Suite

Executes the end-to-end integration test suite verifying input validation, privacy protections, mutual match logic, duplicate swipe rejection, and persistence:

```bash
npm test
```

### 5. Production Build & Start

To build the client SPA and run the Express production server:

```bash
npm run build
npm start
```

The Express server will automatically serve the production-optimized React SPA directly from `client/dist`.

---

## 🎮 How to Test the Demo

1. **Initial Feed**:
   - The dataset begins with 30 seeded profiles.
   - The server dataset contains profiles who have already liked the demo user (e.g., `p01` Aarav, `p04` Kabir, `p07` Sana, `p11` Rohan, `p16` Ananya, `p22` Vikram).
2. **Trigger a Mutual Match**:
   - Swipe **Right** or click **Like** on the first profile (**Aarav**).
   - Because Aarav has an incoming like on you, the celebration modal will immediately trigger with confetti and celebratory messaging!
3. **Trigger a Normal (Non-Matching) Like**:
   - Swipe **Right** on a profile that has not liked you (e.g., `p02` Maya). The like is saved, but no match is generated.
4. **Pass a Profile**:
   - Swipe **Left** or click **Pass** on any profile. It is removed and recorded.
5. **Persistence**:
   - Refresh your browser (`F5` or `Ctrl+R`). Notice that swiped profiles **never reappear**, and your mutual matches remain safely stored in the Matches tab.
6. **Reset Demo**:
   - Click the **Reset Demo** button in the top navigation bar or the empty feed screen, or run:

   **Windows (PowerShell)**:
   ```powershell
   Invoke-RestMethod -Method Post -Uri http://localhost:4000/reset
   ```

   **macOS / Linux (cURL)**:
   ```bash
   curl -X POST http://localhost:4000/reset
   ```

---

## 🔌 API Endpoints Reference

### Summary of Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/feed` | Returns unswiped profiles for the active demo user |
| `POST` | `/swipe` | Submits a swipe decision (`like` or `pass`) and calculates matches |
| `GET` | `/matches` | Returns the list of confirmed mutual matches |
| `POST` | `/reset` | Resets state back to default seeded demo data |
| `GET` | `/health` | Server health check and system status |

---

### Detailed Specifications

#### 1. `GET /feed`
Returns unswiped profiles for the active demo user.

- **Response `200 OK`**:
  ```json
  [
    {
      "id": "p01",
      "name": "Aarav",
      "age": 24,
      "photo": "https://images.unsplash.com/photo-...",
      "bio": "Collecting little moments and big playlists.",
      "city": "Delhi",
      "interests": ["Books", "Music", "Art"]
    }
  ]
  ```
- **Privacy Guarantee**: Does **not** include `incomingLikes` or private user decisions.

---

#### 2. `POST /swipe`
Submits a swipe decision for a profile.

- **Request Body**:
  ```json
  {
    "profileId": "p01",
    "direction": "like"
  }
  ```
- **Validation**:
  - `profileId`: Non-empty string.
  - `direction`: Must strictly be `"like"` or `"pass"`.
- **Responses**:
  - **`200 OK` (Mutual Match)**:
    ```json
    {
      "ok": true,
      "matched": true,
      "match": {
        "id": "p01",
        "name": "Aarav",
        "age": 24,
        "photo": "https://images.unsplash.com/photo-...",
        "city": "Delhi",
        "bio": "Collecting little moments and big playlists.",
        "interests": ["Books", "Music", "Art"],
        "matchedAt": "2026-11-19T07:15:00.000Z"
      }
    }
    ```
  - **`200 OK` (No Match / Pass)**:
    ```json
    {
      "ok": true,
      "matched": false,
      "match": null
    }
    ```
  - **`400 Bad Request`**: Missing parameters or invalid direction.
  - **`404 Not Found`**: Profile ID does not exist in dataset.
  - **`409 Conflict`**: Profile has already been swiped on.

---

#### 3. `GET /matches`
Returns the list of confirmed mutual matches.

- **Response `200 OK`**:
  ```json
  [
    {
      "id": "p01",
      "name": "Aarav",
      "age": 24,
      "photo": "https://images.unsplash.com/photo-...",
      "city": "Delhi",
      "bio": "Collecting little moments and big playlists.",
      "interests": ["Books", "Music", "Art"],
      "matchedAt": "2026-11-19T07:15:00.000Z"
    }
  ]
  ```

---

#### 4. `POST /reset` *(Helper)*
Resets `server/data/state.json` back to default demo seed data.

- **Response `200 OK`**:
  ```json
  {
    "ok": true,
    "message": "State successfully reset to initial demo data."
  }
  ```

---

#### 5. `GET /health`
Returns health check status and timestamp.

- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-20T12:00:00.000Z"
  }
  ```

---

## 🏗 Architecture & Code Structure

```
coy-discover/
├── package.json             # Root workspace script runner (concurrently)
├── README.md                # Project documentation & setup instructions
├── client/                  # React Frontend
│   ├── index.html           # HTML template with typography preconnects
│   ├── package.json         # Client dependencies & scripts
│   ├── vite.config.js       # Vite configuration with API reverse proxy
│   └── src/
│       ├── main.jsx         # React application entry point
│       ├── App.jsx          # Root coordinator (tab state, API calls, modals)
│       ├── styles.css       # Clean, modern, responsive CSS design system
│       ├── services/
│       │   └── api.js       # Centralized API service with fallback handling
│       └── components/
│           ├── Navbar.jsx        # Desktop header with tabs & reset button
│           ├── BottomNav.jsx     # Mobile bottom navigation bar
│           ├── DiscoverView.jsx  # Swiping stage & side context panels
│           ├── SwipeCard.jsx     # Card with pointer drag physics & exit animations
│           ├── ActionButtons.jsx # Tactile Like & Pass buttons
│           ├── MatchesView.jsx   # Mutual matches gallery & detail modal
│           ├── MatchModal.jsx    # Celebration modal with confetti
│           ├── BlankHome.jsx     # Assignment-compliant blank home view
│           ├── EmptyState.jsx    # Polished empty feed and match states
│           └── Toast.jsx         # Non-intrusive feedback toasts
└── server/                  # Express Backend
    ├── index.js             # Server initialization, port fallback, static serving
    ├── package.json         # Server dependencies & scripts
    ├── test-suite.js        # Automated integration test suite
    ├── routes/
    │   └── api.js           # API route controllers
    ├── services/
    │   └── storage.js       # Concurrency-safe state management & match logic
    └── data/
        ├── profiles.json    # 30 seeded profiles dataset
        └── state.json       # Persisted swipes, incoming likes, and matches
```

---

## 💡 Improvements Summary

1. **Modular Frontend Architecture**: Refactored the monolithic 150-line file into 10 reusable, decoupled React components with dedicated services.
2. **Smooth Swipe Physics & Exit Animations**: Dragging now features proportional stamp fading (`LIKE`/`PASS`), responsive card rotation, smooth under-card expansion, and fluid exit transitions when released or triggered via buttons.
3. **Dedicated Mobile Bottom Navigation**: Added a polished bottom navigation bar for mobile viewports conforming to modern dating apps (Tinder, Bumble, Hinge).
4. **Enhanced Matches Experience**: Match cards now display age, location, bio snippets, and open a full-featured profile preview modal with icebreaker conversation starters.
5. **Robust Concurrency-Safe Backend**: Replaced direct unsynchronized file operations with mutex-serialized state updates and atomic file persistence to prevent race conditions during rapid swiping.
6. **Smart Port Fallback**: Auto-detects if Windows Hyper-V/NAT has reserved port 4000 (`EACCES`/`EADDRINUSE`) and binds to port 4001 with automatic Vite dev proxy alignment.
7. **Comprehensive Automated Tests**: Added `npm test` verifying all endpoints, privacy rules, duplicate rejection, and mutual match mechanics.

---

## 📌 Remaining Limitations & Future Work

- **Multi-user Authentication**: This assignment assumes a single demo user. In a full production app, sessions would be governed by JWT / OAuth tokens with an active user table in PostgreSQL / MongoDB.
- **Real-time Messaging**: The Matches view provides an interactive "Say Hello" icebreaker interface; real-time messaging could be enabled via WebSockets (Socket.io) or WebRTC.
- **Photo Uploads**: Seed profiles utilize high-resolution Unsplash photos. A future enhancement could allow uploading custom photos via AWS S3 / Cloudinary.
