import { GITHUB } from '../data';

// Matrix-friendly greens and cyans, brightest for the most used language.
const SHADES = [
  'bg-green-300',
  'bg-green-500',
  'bg-cyan-300',
  'bg-emerald-600',
  'bg-teal-400',
  'bg-lime-400',
  'bg-green-900',
];

/** Share of original repos by primary language. */
export const LanguageBar = () => {
  const total = GITHUB.languages.reduce((sum, lang) => sum + lang.repos, 0);

  return (
    <div data-reveal-item className='space-y-3'>
      <div className='flex h-3 w-full overflow-hidden rounded-full bg-green-950'>
        {GITHUB.languages.map((lang, i) => (
          <span
            key={lang.name}
            title={`${lang.name}: ${lang.repos} repos`}
            className={`${SHADES[i % SHADES.length]} h-full border-r border-black last:border-r-0 hover:brightness-125 transition-[filter]`}
            style={{ width: `${(lang.repos / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className='flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-green-400/90'>
        {GITHUB.languages.map((lang, i) => (
          <li key={lang.name} className='flex items-center gap-1.5'>
            <span className={`size-2 rounded-full ${SHADES[i % SHADES.length]}`} />
            {lang.name}
            <span className='text-green-600'>{Math.round((lang.repos / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
