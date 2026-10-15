/**
 * Search metadata for every route. Shared by the runtime (to update <head> on
 * client-side navigation) and the build (to prerender a <head> per route), so
 * keep it free of browser and app imports.
 */
export const SITE = {
  url: 'https://ahmadjinadu.com',
  name: 'Ahmad Jinadu',
  jobTitle: 'Senior Software Engineer',
  location: 'Lagos, Nigeria',
  email: 'ahmadjinadu@gmail.com',
  github: 'https://github.com/arkmadj',
  linkedin: 'https://www.linkedin.com/in/ahmad-jinadu/',
  intro:
    'Ahmad Jinadu is a Senior Software Engineer based in Lagos, Nigeria. He builds fast, production-ready web and mobile apps with React and TypeScript, owning features end to end from architecture to UI polish.',
} as const;

export interface PageMeta {
  path: string;
  /** Short label, used for sitelinks and navigation. */
  label: string;
  title: string;
  description: string;
}

export const PAGES: PageMeta[] = [
  {
    path: '/',
    label: 'Home',
    title: `${SITE.name}, ${SITE.jobTitle}`,
    description:
      'Ahmad Jinadu is a Senior Software Engineer in Lagos, Nigeria, building fast, production-ready web and mobile apps with React and TypeScript.',
  },
  {
    path: '/about',
    label: 'About',
    title: `About ${SITE.name}, ${SITE.jobTitle}`,
    description:
      "Ahmad Jinadu's experience, skills and background: React, TypeScript, web performance, real-time systems, test automation and AI model evaluation.",
  },
  {
    path: '/projects',
    label: 'Projects',
    title: `Projects by ${SITE.name}`,
    description:
      'Live side projects by Ahmad Jinadu: real-time multiplayer games over WebRTC, a Formula 1 companion app and offline-first PWAs on the edge.',
  },
];

/** Unknown paths fall back to Home's metadata. */
export const getPageMeta = (path: string) => {
  const normalized = path.replace(/\/+$/, '') || '/';
  return PAGES.find((page) => page.path === normalized) ?? PAGES[0];
};

export const absoluteUrl = (path: string) => `${SITE.url}${path === '/' ? '/' : path}`;

/** schema.org graph telling search engines who the site is about. */
export const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE.url}/#person`,
      name: SITE.name,
      jobTitle: SITE.jobTitle,
      description: SITE.intro,
      url: `${SITE.url}/`,
      email: `mailto:${SITE.email}`,
      address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
      knowsAbout: ['React', 'TypeScript', 'Web Performance', 'Real-Time Systems', 'Progressive Web Apps', 'Test Automation', 'Edge Computing'],
      sameAs: [SITE.github, SITE.linkedin],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: `${SITE.url}/`,
      name: SITE.name,
      alternateName: `${SITE.name} | ${SITE.jobTitle}`,
      publisher: { '@id': `${SITE.url}/#person` },
    },
    {
      '@type': 'ProfilePage',
      '@id': `${SITE.url}/#profile`,
      url: `${SITE.url}/`,
      name: PAGES[0].title,
      mainEntity: { '@id': `${SITE.url}/#person` },
      isPartOf: { '@id': `${SITE.url}/#website` },
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE.url}/#navigation`,
      itemListElement: PAGES.map((page, index) => ({
        '@type': 'SiteNavigationElement',
        position: index + 1,
        name: page.label,
        description: page.description,
        url: absoluteUrl(page.path),
      })),
    },
  ],
};
