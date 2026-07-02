# Personal Portfolio

A Matrix-themed interactive portfolio website featuring a breakout-style game built with React, TypeScript, and Anime.js.

## Features

- 🎮 **Interactive Game**: Breakout/Pong-style game with physics engine and collision detection
- 🎨 **Matrix Theme**: Retro green-on-black aesthetic with animated grid background
- ⚡ **Smooth Animations**: Powered by Anime.js for fluid character and element animations
- 📱 **Responsive Design**: Adapts to different screen sizes with Tailwind CSS
- 🚀 **Fast Performance**: Built with Vite for lightning-fast development and builds
- ☁️ **Cloudflare Ready**: Configured for deployment to Cloudflare Pages

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4
- **Animations**: Anime.js 4
- **Routing**: React Router 7
- **Deployment**: Cloudflare Pages (via Wrangler)
- **Icons**: Radix UI Icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the application.

### Building

```bash
# Build for production
npm run build
```

### Preview & Deploy

```bash
# Preview production build locally
npm run preview

# Deploy to Cloudflare Pages
npm run deploy
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context (game state management)
├── pages/          # Route pages (Home, About, Projects)
├── routes/         # Router configuration
├── lib/            # Utility functions
└── assets/         # Static assets
```

## Game Controls

- **Keyboard**: Use arrow keys or A/D to move the bat
- **Mouse**: Click to start, drag the ball to launch
- **Objective**: Break all characters in the welcome text

## License

MIT
