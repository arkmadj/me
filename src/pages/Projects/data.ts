export interface Project {
  slug: string;
  name: string;
  tagline: string;
  glyph: string;
  stack: string[];
  live: string;
  source: string;
  aside?: string;
  highlights: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: 'retro-squares',
    name: 'Retro Squares',
    tagline: 'Real-time multiplayer retro games',
    glyph: '▚▞',
    stack: ['TanStack Start', 'React 19', 'WebRTC', 'Durable Objects', 'Cloudflare Workers'],
    live: 'https://retro-squares.ahmadjinadu.com',
    source: 'https://github.com/arkmadj/retro-squares',
    aside: 'Liked the pong on the home page? This one has a second player.',
    highlights: [
      'Two-player Pong with a retro CRT look, peer-to-peer over WebRTC data channels with STUN/TURN NAT traversal and a WebSocket fallback.',
      'Cloudflare Durable Objects run the game rooms and signalling.',
      'Latency-fair matchmaking hosts each match in the region closest to the farther player, and clock sync makes serves start at the same moment for both.',
    ],
  },
  {
    slug: 'f1-app',
    name: 'F1 App',
    tagline: 'Formula 1 companion app',
    glyph: '◷',
    stack: ['React', 'TanStack Router', 'TanStack Query', 'Vite', 'Cloudflare Workers'],
    live: 'https://f1.ahmadjinadu.com',
    source: 'https://github.com/arkmadj/f1-app',
    highlights: [
      'Standings, calendars, race, qualifying and sprint results, plus driver, constructor and circuit profiles for 2020–2026.',
      'Head-to-head comparisons with radar and points-progression charts, shareable URL state, CSV export and add-to-calendar.',
      'English/Spanish i18n, light/dark themes and reduced-motion support, tested with Vitest and Testing Library behind Husky quality gates.',
    ],
  },
  {
    slug: 'meteo',
    name: 'Meteo',
    tagline: 'Offline-first weather PWA',
    glyph: '☁',
    stack: ['React', 'TanStack Query', 'PWA', 'Leaflet', 'Docker'],
    live: 'https://meteo.ahmadjinadu.com',
    source: 'https://github.com/arkmadj/meteo',
    highlights: [
      'Real-time conditions, forecasts, interactive Leaflet maps and customisable dashboard widgets.',
      'Offline-first data layer with smart caching, background refetching, request deduplication and exponential-backoff retries.',
      'Service-worker push alerts, code splitting and lazy loading, WCAG-focused accessibility, i18n and dark mode.',
    ],
  },
];
