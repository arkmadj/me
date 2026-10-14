import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/hooks/useReveal';

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const format = (n: number) => (n >= 10_000 ? compact.format(n) : n.toLocaleString('en'));

interface StatCounterProps {
  value: number;
  suffix: string;
  label: string;
}

/** Counts up from zero the first time it scrolls into view. */
export const StatCounter = ({ value, suffix, label }: StatCounterProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * value));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div
      ref={ref}
      data-reveal-item
      className='rounded-lg border border-green-400/20 bg-black/70 p-4 text-center hover:border-green-400/60 hover:-translate-y-1 transition-all duration-300'
    >
      <div className='text-3xl md:text-4xl font-bold text-green-300 tabular-nums drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]'>
        {format(count)}
        {suffix}
      </div>
      <div className='mt-1 text-xs uppercase tracking-widest text-green-500/70'>{label}</div>
    </div>
  );
};
