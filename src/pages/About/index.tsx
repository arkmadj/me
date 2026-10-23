import { useRef } from 'react';
import { Link } from 'react-router-dom';
import MatrixRain from '@/components/common/MatrixRain';
import { Backdrop } from '@/components/common/Backdrop';
import { ROUTES } from '@/routes/paths';
import { CORE_SKILLS, EDUCATION, GITHUB, PROFILE, SKILL_GROUPS, STATS } from './data';
import { useReveal } from '@/hooks/useReveal';
import { TerminalHero } from './components/TerminalHero';
import { StatCounter } from './components/StatCounter';
import { ExperienceLog } from './components/ExperienceLog';
import { DecryptText } from '@/components/ui/DecryptText';
import { Section } from '@/components/ui/Section';
import { LanguageBar } from './components/LanguageBar';

const Tag = ({ label, strong }: { label: string; strong?: boolean }) => (
  <span
    data-reveal-item
    className={
      strong
        ? 'px-3 py-1.5 rounded border border-green-400 bg-green-400/10 text-green-200 text-sm hover:bg-green-400 hover:text-black hover:shadow-[0_0_12px_rgba(34,197,94,0.7)] transition-all duration-300'
        : 'px-3 py-1.5 rounded border border-green-400/25 bg-black/60 text-green-400/90 text-sm hover:border-green-400 hover:text-green-200 transition-all duration-300'
    }
  >
    <DecryptText text={label} />
  </span>
);

const About = () => {
  const scrollRef = useRef<HTMLElement>(null);
  useReveal(scrollRef);

  return (
    <div className='relative z-10 h-full overflow-hidden'>
      <Backdrop />
      <MatrixRain className='absolute inset-0 z-0 opacity-10' />

      <main
        ref={scrollRef}
        className='relative z-10 h-full overflow-y-auto px-4 md:px-6 pt-10 pb-32 font-mono'
      >
        <div className='mx-auto max-w-4xl space-y-14'>
          <TerminalHero />

          <section data-reveal className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            {STATS.map((stat) => (
              <StatCounter key={stat.label} {...stat} />
            ))}
          </section>

          <Section title='git log --career'>
            <ExperienceLog />
          </Section>

          <Section title='gh api /users/arkmadj'>
            <div className='space-y-6 rounded-xl border border-green-400/20 bg-black/70 p-5 md:p-6'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                {GITHUB.stats.map((stat) => (
                  <StatCounter key={stat.label} {...stat} />
                ))}
              </div>
              <div className='space-y-2'>
                <p className='text-xs text-green-600'>// primary language, by repo</p>
                <LanguageBar />
              </div>
              <p className='text-[11px] text-green-700'>
                public activity only · snapshot {GITHUB.fetchedAt}
              </p>
            </div>
          </Section>

          <Section title='stack'>
            <div className='grid md:grid-cols-2 gap-x-8 gap-y-5 rounded-xl border border-green-400/20 bg-black/70 p-5 md:p-6'>
              {SKILL_GROUPS.map((group) => (
                <div key={group.label} className='space-y-2'>
                  <p className='text-xs text-green-600'>// {group.label}</p>
                  <div className='flex flex-wrap gap-2'>
                    {group.items.map((skill) => (
                      <Tag key={skill} label={skill} strong={CORE_SKILLS.has(skill)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title='education'>
            <div className='flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border border-green-400/20 bg-black/70 p-5 md:p-6'>
              <span className='font-bold text-green-300'>{EDUCATION.school}</span>
              <span className='text-green-400/90'>{EDUCATION.degree}</span>
              <span className='ml-auto text-xs text-green-600'>{EDUCATION.period}</span>
            </div>
          </Section>

          <section data-reveal className='text-center space-y-6 pt-4'>
            <p className='text-green-300 text-lg'>
              This is your last chance. <span className='text-green-500/70'>After this, there is no turning back.</span>
            </p>
            <div className='flex flex-wrap justify-center gap-4'>
              <a
                href={`mailto:${PROFILE.email}?subject=Hello%20Ahmad`}
                className='group flex items-center gap-2 px-5 py-3 rounded-full border border-red-500/60 text-red-300 hover:bg-red-500 hover:text-black hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] transition-all duration-300'
              >
                <span className='inline-block w-4 h-2 rounded-full bg-red-500 group-hover:bg-black transition-colors' />
                Red pill — let's build something
              </a>
              <Link
                to={ROUTES.HOME}
                viewTransition
                className='group flex items-center gap-2 px-5 py-3 rounded-full border border-blue-500/60 text-blue-300 hover:bg-blue-500 hover:text-black hover:shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all duration-300'
              >
                <span className='inline-block w-4 h-2 rounded-full bg-blue-500 group-hover:bg-black transition-colors' />
                Blue pill — back to pong
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
