import { useEffect, useState } from 'react';
import { PROFILE } from '../data';
import { prefersReducedMotion } from '@/hooks/useReveal';
import { RotatingText } from '@/components/ui/RotatingText';

const COMMAND = 'whoami';

const LINKS = [
  { label: './email', href: `mailto:${PROFILE.email}` },
  { label: './call', href: `tel:${PROFILE.phone.replace(/\s/g, '')}` },
  { label: './linkedin', href: PROFILE.linkedin, external: true },
  { label: './github', href: PROFILE.github, external: true },
];

export const TerminalHero = () => {
  const [typed, setTyped] = useState(() => (prefersReducedMotion() ? COMMAND : ''));
  const done = typed.length === COMMAND.length;

  useEffect(() => {
    if (done) return;
    const timeout = setTimeout(() => setTyped(COMMAND.slice(0, typed.length + 1)), 110);
    return () => clearTimeout(timeout);
  }, [typed, done]);

  return (
    <header className='w-full rounded-xl border border-green-400/30 bg-black/75 shadow-[0_0_40px_rgba(34,197,94,0.12)] overflow-hidden'>
      <div className='flex items-center gap-2 px-4 py-2.5 border-b border-green-400/20 bg-green-400/5'>
        <span className='size-3 rounded-full bg-red-500/80' />
        <span className='size-3 rounded-full bg-yellow-500/80' />
        <span className='size-3 rounded-full bg-green-500/80' />
        <span className='ml-3 text-xs text-green-500/60'>ahmad@lagos: ~</span>
      </div>

      <div className='p-6 md:p-8 space-y-5'>
        <p className='text-sm text-green-500/80'>
          <span className='text-green-300'>➜</span> <span className='text-cyan-300'>~</span> {typed}
          {!done && <span className='animate-pulse'>█</span>}
        </p>

        <div
          className={`space-y-4 transition-all duration-700 ${
            done ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <h1 className='text-4xl md:text-6xl font-bold text-green-300 tracking-tight drop-shadow-[0_0_14px_rgba(34,197,94,0.6)]'>
            {PROFILE.name}
          </h1>
          <p className='text-lg md:text-xl text-green-400'>
            {PROFILE.role} <span className='text-green-600'>//</span>{' '}
            <RotatingText items={PROFILE.focuses} active={done} className='text-cyan-300' />
          </p>
          <p className='max-w-2xl text-green-200/80 leading-relaxed'>{PROFILE.summary}</p>

          <div className='flex flex-wrap items-center gap-3 pt-2 text-sm'>
            <span className='flex items-center gap-1.5 text-green-500/80'>
              <span className='relative flex size-2'>
                <span className='absolute inline-flex size-full rounded-full bg-green-400 opacity-75 animate-ping' />
                <span className='relative inline-flex size-2 rounded-full bg-green-400' />
              </span>
              {PROFILE.location}
            </span>
            {LINKS.map(({ label, href, external }) => (
              <a
                key={label}
                href={href}
                {...(external && { target: '_blank', rel: 'noreferrer' })}
                className='px-3 py-1.5 rounded border border-green-400/40 text-green-300 hover:bg-green-400 hover:text-black transition-colors'
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
