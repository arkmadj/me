# Personal Portfolio

A Matrix-themed interactive portfolio website featuring a breakout-style game, built with React, TypeScript, and Anime.js.

## Features

- 🎮 **Interactive Game**: Breakout-style game on the home page with a custom physics engine, collision detection, lives, pause menu, and Web Audio sound effects
- 🎨 **Matrix Theme**: Retro green-on-black aesthetic with Matrix rain, HUD frame, and decrypting text effects
- 👤 **About Page**: Terminal-style hero, experience log, and GitHub stats (counters and language breakdown)
- 🗂️ **Projects Page**: Project cards driven by a simple data file
- ⚡ **Smooth Animations**: Powered by Anime.js, with support for `prefers-reduced-motion`
- 📱 **Responsive & Touch-Friendly**: Tailwind CSS layout with touch controls for the game
- 🔎 **SEO**: Per-route meta tags, structured data, `sitemap.xml`, and `robots.txt` generated at build time
- ☁️ **Cloudflare Ready**: Built and deployed with the Cloudflare Vite plugin and Wrangler

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Animations**: Anime.js 4
- **Routing**: React Router 7
- **Deployment**: Cloudflare (via Wrangler)
- **Icons**: Radix UI Icons

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application. The dev server is exposed on your network and prints a QR code so you can open it on a phone.

### Scripts

| Command           | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                            |
| `npm run build`   | Type-check and build for production                  |
| `npm run lint`    | Run ESLint                                           |
| `npm run preview` | Build, then serve the production build with Wrangler |
| `npm run deploy`  | Build, then deploy to Cloudflare                     |

### Updating GitHub Stats

The About page reads a snapshot from `src/pages/About/github-stats.json`. To refresh it:

```bash
node scripts/github-stats.mjs

# Also sum lines added across repos (slow; set a token to avoid the 60 req/hr limit)
GITHUB_TOKEN=<token> node scripts/github-stats.mjs --lines
```

## Project Structure

```
src/
├── components/
│   ├── common/     # Shared app pieces (navigation, game overlay, HUD, Matrix rain, splash)
│   ├── layout/     # Page layout
│   └── ui/         # Small UI primitives (Button, Kbd, DecryptText, RotatingText, ...)
├── context/        # Game state (lives, game state, sound)
├── hooks/          # Shared hooks (page meta, reveal, rotating text, sound)
├── pages/          # Home (game), About, Projects, NotFound
├── routes/         # Router configuration and route paths
├── lib/            # Utility functions
├── seo.ts          # Site and per-page SEO metadata
└── assets/         # Static assets
scripts/            # Maintenance scripts (GitHub stats snapshot)
seo-plugin.ts       # Vite plugin that injects SEO tags and emits sitemap/robots
```

## Game Controls

| Action           | Keyboard            | Touch                      |
| ---------------- | ------------------- | -------------------------- |
| Launch the ball  | `Space` or drag it  | Tap or flick the ball      |
| Move the paddle  | `←` / `→`           | Drag anywhere              |
| Pause / resume   | `Space` or `Esc`    | Pause button in the HUD    |

**Objective**: Break every character in the welcome text before you run out of lives (you start with 3).

## License

MIT
