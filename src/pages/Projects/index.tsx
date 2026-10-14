import { useRef } from 'react';
import { Link } from 'react-router-dom';
import MatrixRain from '@/components/common/MatrixRain';
import { ROUTES } from '@/routes/paths';
import { useReveal } from '@/hooks/useReveal';
import { PROJECTS } from './data';
import { ProjectCard } from './components/ProjectCard';

const Projects = () => {
  const scrollRef = useRef<HTMLElement>(null);
  useReveal(scrollRef);

  return (
    <div className='relative z-10 h-full overflow-hidden'>
      <MatrixRain className='absolute inset-0 z-0 opacity-10' />

      <main
        ref={scrollRef}
        className='relative z-10 h-full overflow-y-auto px-4 md:px-6 pt-10 pb-32 font-mono'
      >
        <div className='mx-auto max-w-4xl space-y-10'>
          <header data-reveal className='space-y-3'>
            <p className='text-sm text-green-500/80'>
              <span className='text-green-300'>➜</span> <span className='text-cyan-300'>~</span> ls
              ./projects --live
            </p>
            <h1 className='text-4xl md:text-6xl font-bold text-green-300 tracking-tight drop-shadow-[0_0_14px_rgba(34,197,94,0.6)]'>
              Things I've shipped
            </h1>
            <p className='max-w-2xl text-green-200/80 leading-relaxed'>
              Side projects where I get to try real-time networking, edge deployments and
              offline-first data. They're all deployed, so go ahead and try them.
            </p>
          </header>

          {PROJECTS.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}

          <footer data-reveal className='flex flex-wrap items-center justify-center gap-4 pt-4 text-sm'>
            <a
              href='https://github.com/arkmadj?tab=repositories'
              target='_blank'
              rel='noreferrer'
              className='px-5 py-3 rounded-full border border-green-400/40 text-green-300 hover:bg-green-400 hover:text-black hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all duration-300'
            >
              More on GitHub →
            </a>
            <Link
              to={ROUTES.ABOUT}
              className='px-5 py-3 rounded-full border border-green-400/20 text-green-500 hover:border-green-400 hover:text-green-200 transition-all duration-300'
            >
              cd ../about
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Projects;
