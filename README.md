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

Optional:

```bash
npm run revideo:editor
npm run build
npm start
```

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
