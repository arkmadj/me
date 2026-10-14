import { useState } from 'react';
import { EXPERIENCE } from '../data';
import { cn } from '@/lib/utils';

/** Career history rendered as an expandable `git log`. */
export const ExperienceLog = () => {
  const [open, setOpen] = useState<string | null>(EXPERIENCE[0].hash);

  return (
    <ol className='relative space-y-3 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-green-400/25'>
      {EXPERIENCE.map((role) => {
        const isOpen = open === role.hash;
        return (
          <li key={role.hash} data-reveal-item className='relative pl-8'>
            <span
              className={cn(
                'absolute left-0 top-4 size-[15px] rounded-full border-2 border-green-400 bg-black transition-all',
                (isOpen || role.current) && 'bg-green-400 shadow-[0_0_12px_rgba(34,197,94,0.9)]'
              )}
            />
            <button
              type='button'
              onClick={() => setOpen(isOpen ? null : role.hash)}
              aria-expanded={isOpen}
              className={cn(
                'w-full text-left rounded-lg border bg-black/70 px-4 py-3 transition-all duration-300 cursor-pointer',
                isOpen
                  ? 'border-green-400/60 shadow-[0_0_20px_rgba(34,197,94,0.12)]'
                  : 'border-green-400/15 hover:border-green-400/40'
              )}
            >
              <div className='flex flex-wrap items-baseline gap-x-3 gap-y-1'>
                <span className='text-xs text-yellow-400/80'>{role.hash}</span>
                <span className='font-bold text-green-300'>{role.company}</span>
                <span className='text-green-500/80 text-sm'>{role.title}</span>
                {role.current && (
                  <span className='text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-green-400/15 text-green-300 border border-green-400/40'>
                    HEAD
                  </span>
                )}
                <span className='ml-auto text-xs text-green-600'>{role.period}</span>
              </div>

              <div
                className={cn(
                  'grid transition-all duration-500 ease-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <ul className='overflow-hidden space-y-1.5 text-sm text-green-200/80 leading-relaxed'>
                  {role.highlights.map((line) => (
                    <li key={line} className='flex gap-2'>
                      <span className='text-green-400 shrink-0'>+</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
};
