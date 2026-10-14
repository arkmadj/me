import type { ReactNode } from 'react';

/** Page section with a `# command`-style heading; fades in via `useReveal`. */
export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section data-reveal className='space-y-4'>
    <h2 className='flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-green-500'>
      <span className='text-green-300'>#</span>
      {title}
      <span className='flex-1 h-px bg-linear-to-r from-green-400/40 to-transparent' />
    </h2>
    {children}
  </section>
);
