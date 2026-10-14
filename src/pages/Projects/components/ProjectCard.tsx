import { DecryptText } from '@/components/ui/DecryptText';
import type { Project } from '../data';

const host = (url: string) => new URL(url).host;

export const ProjectCard = ({ project, index }: { project: Project; index: number }) => (
  <article
    data-reveal
    className='group rounded-xl border border-green-400/25 bg-black/75 overflow-hidden hover:border-green-400/60 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] transition-all duration-500'
  >
    {/* Browser chrome pointing at the live deployment */}
    <div className='flex items-center gap-3 px-4 py-2.5 border-b border-green-400/20 bg-green-400/5'>
      <div className='flex gap-1.5 shrink-0'>
        <span className='size-2.5 rounded-full bg-red-500/70' />
        <span className='size-2.5 rounded-full bg-yellow-500/70' />
        <span className='size-2.5 rounded-full bg-green-500/70' />
      </div>
      <a
        href={project.live}
        target='_blank'
        rel='noreferrer'
        className='flex-1 min-w-0 truncate rounded bg-black/60 border border-green-400/15 px-3 py-1 text-xs text-green-500/80 hover:text-green-300 transition-colors'
      >
        <span className='text-green-700'>https://</span>
        {host(project.live)}
      </a>
      <span className='hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-green-400'>
        <span className='relative flex size-2'>
          <span className='absolute inline-flex size-full rounded-full bg-green-400 opacity-75 animate-ping' />
          <span className='relative inline-flex size-2 rounded-full bg-green-400' />
        </span>
        live
      </span>
    </div>

    <div className='grid md:grid-cols-[180px_1fr]'>
      {/* CRT-style glyph panel */}
      <div className='relative hidden md:flex items-center justify-center border-r border-green-400/15 bg-green-950/30 overflow-hidden'>
        <span className='text-6xl text-green-400/80 drop-shadow-[0_0_16px_rgba(34,197,94,0.8)] group-hover:scale-110 transition-transform duration-500'>
          {project.glyph}
        </span>
        <span className='absolute top-3 left-3 text-[10px] text-green-700'>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className='pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.35)_0px,rgba(0,0,0,0.35)_1px,transparent_1px,transparent_3px)]' />
      </div>

      <div className='p-5 md:p-6 space-y-4'>
        <header className='space-y-1'>
          <h2 className='text-2xl md:text-3xl font-bold text-green-300 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]'>
            <DecryptText text={project.name} />
          </h2>
          <p className='text-green-400/90'>{project.tagline}</p>
          {project.aside && <p className='text-sm text-cyan-300/90'>// {project.aside}</p>}
        </header>

        <ul className='space-y-1.5 text-sm text-green-200/80 leading-relaxed'>
          {project.highlights.map((line) => (
            <li key={line} className='flex gap-2'>
              <span className='text-green-400 shrink-0'>›</span>
              {line}
            </li>
          ))}
        </ul>

        <p className='text-xs text-green-600'>
          {project.stack.join(' · ')}
        </p>

        <div className='flex flex-wrap gap-3 pt-1'>
          <a
            href={project.live}
            target='_blank'
            rel='noreferrer'
            className='px-4 py-2 rounded border border-green-400 bg-green-400/10 text-green-200 text-sm hover:bg-green-400 hover:text-black hover:shadow-[0_0_16px_rgba(34,197,94,0.7)] transition-all duration-300'
          >
            ▶ launch
          </a>
          <a
            href={project.source}
            target='_blank'
            rel='noreferrer'
            className='px-4 py-2 rounded border border-green-400/30 text-green-400 text-sm hover:border-green-400 hover:text-green-200 transition-all duration-300'
          >
            {'</>'} source
          </a>
        </div>
      </div>
    </div>
  </article>
);
