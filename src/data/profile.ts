/** Core identity, shared by Home and About. Kept free of heavy imports (e.g. GitHub stats) so Home stays lean. */
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
