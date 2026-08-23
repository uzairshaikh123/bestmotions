# BestMotions

Web app for building short motion clips for documentary / YouTube-style edits. Browse **120 Revideo templates** by category, preview in the browser, tweak copy/colors/images, export an MP4.

No login. Everything runs locally. Powered by [Revideo](https://github.com/redotvideo/revideo) only.

## What it does

- Browse parameterized motion templates (books, newspapers, fire, YT, timelines, India/shorts, maps, charts, text, photos, UI)
- Play a preview from the gallery grid without opening the editor
- Customize fields in a detail view and export MP4 via Revideo (`renderVideo`)

## Stack

| Layer | Choice |
| --- | --- |
| UI | React 18, Vite 6, TypeScript |
| API | Express |
| Scenes / render | `@revideo/2d`, `@revideo/core`, `@revideo/player-react`, `@revideo/renderer` |

## Repo layout

```
client/          Vite React app (gallery, editor, player)
  assets/        Template catalog (120 assets + categories)
server/          Express API + Revideo render helper
revideo/         Revideo project + scene packs
  scenes/packs/  fire, yt, newspaper, timeline, india, …
public/videos/   Rendered MP4 output
```

## Setup

Node 18+ recommended. Chrome/Chromium is used under the hood for Revideo renders (first run may download a browser binary).

```bash
npm install
```

Optional `.env`:

```env
PORT=3001
```

## Run

```bash
npm run dev:server   # http://localhost:3001
npm run dev:client   # http://localhost:5173
```

Or both:

```bash
npm run dev
```

## Docker deployment

Use two separate containers/services:

1. Backend API: Node + Express + Revideo render server
2. Frontend: Vite static build behind Nginx

The backend should not serve the frontend in production. Set this env var on the API container:

```env
SERVE_FRONTEND=false
```

Then build the frontend with a backend URL:

```bash
VITE_API_BASE=https://api.example.com npm run build
```

Optional:

```bash
npm run revideo:editor
npm run build
npm start
```

### Docker compose example

```bash
docker compose up --build
```

This repo includes separate Dockerfiles for:

- `Dockerfile.backend` for the API server
- `Dockerfile.frontend` for the static frontend
- `docker-compose.yml` to run both together locally

## App tabs

**Assets (home)**  
Template grid with category filters and search. Play mounts one Revideo preview per card. Customize opens the editor + MP4 export (`POST /api/revideo-render`).

**AI**  
Placeholder — prompt-to-video coming later.

## Categories

Books · Newspaper · Fire · YT Topic · Timeline · India · Shorts · Maps · 3D/globe · Text · Photos · Charts · UI

## API

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/revideo-render` | Revideo variables → MP4 |
| GET | `/api/health` | Liveness |
| static | `/videos/*` | Served MP4s |

## License

Private project unless you add a license file.
