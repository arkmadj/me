import githubStats from './github-stats.json';

export const PROFILE = {
  name: 'Ahmad Jinadu',
  role: 'Senior Software Engineer',
  /** Cycled through in the Home tagline and About hero. */
  focuses: [
    'React & TypeScript',
    'Web Performance',
    'Real-Time Systems',
    'Offline-First PWAs',
    'Test Automation',
    'Edge Computing',
    'AI Model Evaluation',
  ],
  location: 'Lagos, Nigeria',
  email: 'ahmadjinadu@gmail.com',
  phone: '+234 813 0215 866',
  github: 'https://github.com/arkmadj',
  linkedin: 'https://www.linkedin.com/in/ahmad-jinadu/',
  summary:
    'I build production web and mobile apps that move business metrics: faster apps, conversion-driven marketing sites, and test suites that let teams ship with confidence. I own features end to end, from early architecture calls to UI polish. Right now I benchmark AI models at Turing, and on the side I build real-time, offline-first products on the edge.',
};

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
const yearsOnGithub = Math.floor((Date.now() - Date.parse(githubStats.joined)) / MS_PER_YEAR);

/** Public GitHub snapshot; refresh with `node scripts/github-stats.mjs`. */
export const GITHUB = {
  stats: [
    { value: githubStats.commits, suffix: '+', label: 'public commits' },
    { value: githubStats.mergedPRs, suffix: '', label: 'PRs merged' },
    { value: githubStats.repos, suffix: '', label: 'original repos' },
    { value: yearsOnGithub, suffix: '', label: 'years on GitHub' },
    ...(githubStats.linesWritten
      ? [{ value: githubStats.linesWritten, suffix: '+', label: 'lines written' }]
      : []),
  ],
  languages: githubStats.languages,
  fetchedAt: githubStats.fetchedAt,
};

export interface Role {
  hash: string;
  company: string;
  title: string;
  period: string;
  current?: boolean;
  highlights: string[];
}

export const EXPERIENCE: Role[] = [
  {
    hash: 'a1f3c9e',
    company: 'Turing',
    title: 'Software Engineer',
    period: 'Apr 2024 — Present',
    current: true,
    highlights: [
      'Benchmark and stress-test AI models against real-world applications and open-source codebases.',
      'Build real-world apps and QA evaluation suites that systematically improve model output quality.',
      'Turn telemetry and evaluation metrics into actionable insights for model accuracy.',
    ],
  },
  {
    hash: '7be20d4',
    company: 'Oval',
    title: 'Fullstack Engineer',
    period: '2023 — 2024',
    highlights: [
      'Shipped automatic inactivity logout to protect customer data on unattended devices.',
      'Redesigned the customer app with Clean Design Thinking, simplifying core flows and lifting satisfaction.',
      'Built automated frontend test suites so the team could rework the UI without regressions.',
    ],
  },
  {
    hash: 'c48e1a0',
    company: 'Zobo',
    title: 'Fullstack Engineer (Contract)',
    period: '2023 — 2024',
    highlights: [
      'Led a greenfield React project, building responsive UI components that sped up delivery.',
      'Built a high-performing, SEO-tuned marketing site that lifted conversions.',
      'Set up testing and analytics to keep the site reliable and drive UX iteration.',
    ],
  },
  {
    hash: '3d9f6b2',
    company: 'B54',
    title: 'Fullstack Engineer',
    period: '2022 — 2023',
    highlights: [
      'Overhauled the customer app with lazy loading, code splitting and tree-shaking — 70% faster.',
      'Rebuilt the marketing site for SEO, accessibility and speed — up to 90% faster, with higher conversions.',
      'Built real-time CSV/Excel upload validation that flags bad data before users submit.',
      'Introduced testing and monitoring that cut the time to detect and resolve production issues.',
    ],
  },
  {
    hash: 'e05a7c1',
    company: 'Shara',
    title: 'Fullstack Engineer (Contract)',
    period: 'Jan 2021 — 2022',
    highlights: [
      'Built the beta of a new mobile app, driving ~35% growth in new customers.',
      'Maintained legacy apps while designing new ones, improving UX and system performance.',
      'Evaluated solutions during architecture planning and migration for long-term scale.',
      'Worked directly with clients to turn problem statements into system designs.',
    ],
  },
  {
    hash: '9c2b48f',
    company: 'Chronos Capital',
    title: 'Fullstack Engineer (Contract)',
    period: 'Jan 2021 — 2022',
    highlights: [
      'Maintained and patched production web apps, resolving bugs and performance issues.',
      'Proposed and shipped architectural changes that removed bottlenecks and improved scalability.',
      'Partnered with product and design to build and test features shaped by user research.',
    ],
  },
];

/** Daily drivers; highlighted wherever they appear in SKILL_GROUPS. */
export const CORE_SKILLS = new Set(['TypeScript', 'React', 'Rust', 'Docker', 'JavaScript', 'Node.js']);

export const SKILL_GROUPS = [
  { label: 'languages', items: ['TypeScript', 'JavaScript', 'Rust', 'Go', 'Python', 'C++'] },
  {
    label: 'frontend',
    items: [
      'React',
      'Next.js',
      'React Native',
      'Expo',
      'Vue.js',
      'NuxtJS',
      'TanStack',
      'Tailwind CSS',
      'Material UI',
      'Vite',
      'i18next',
      'PWAs',
    ],
  },
  {
    label: 'backend & data',
    items: ['Node.js', 'NestJS', 'Adonis', 'GraphQL', 'PostgreSQL', 'MySQL', 'MongoDB'],
  },
  {
    label: 'real-time & cloud',
    items: ['WebRTC', 'WebSockets', 'Cloudflare Workers', 'Durable Objects', 'Docker', 'Kubernetes', 'CI/CD'],
  },
  {
    label: 'testing & quality',
    items: [
      'Jest',
      'Vitest',
      'Testing Library',
      'Cypress',
      'Playwright',
      'Storybook',
      'Chromatic',
      'Lighthouse',
      'ESLint',
      'Prettier',
      'Husky',
    ],
  },
  {
    label: 'how I work',
    items: [
      'Web Performance',
      'Accessibility (WCAG)',
      'SEO',
      'Design Systems',
      'System Design',
      'Software Architecture',
      'Algorithms & Data Structures',
      'AI Model Evaluation',
      'Git',
      'Open Source',
      'Team Leadership',
    ],
  },
];

const skillCount = (label: string) => SKILL_GROUPS.find((g) => g.label === label)?.items.length ?? 0;

/** One tile per strength: `path` reads like a directory, `stack` names the tools behind it. */
export const STATS = [
  {
    path: 'experience',
    value: 5,
    suffix: '+',
    label: 'years in production',
    stack: ['React', 'TypeScript', 'Node.js'],
  },
  {
    path: 'frontend',
    value: skillCount('frontend'),
    suffix: '',
    label: 'ui tools',
    stack: ['Next.js', 'React Native', 'PWAs'],
  },
  {
    path: 'quality',
    value: skillCount('testing & quality'),
    suffix: '',
    label: 'testing tools',
    stack: ['Playwright', 'Cypress', 'Vitest'],
  },
  {
    path: 'realtime',
    value: skillCount('real-time & cloud'),
    suffix: '',
    label: 'edge & infra tools',
    stack: ['WebRTC', 'Workers', 'Docker'],
  },
];

export const EDUCATION = {
  school: 'University of Lagos',
  degree: 'B.Sc. Computer Science',
  period: '2015 — 2019',
};
