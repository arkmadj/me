import { useEffect, type RefObject } from 'react';
import { animate, stagger } from 'animejs';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Fades in every `[data-reveal]` element inside `root` as it scrolls into view.
 * Children marked `[data-reveal-item]` are staggered in after their section.
 */
export const useReveal = (root: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const container = root.current;
    if (!container) return;

    const sections = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (prefersReducedMotion()) return;

    sections.forEach((section) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(24px)';
      section.querySelectorAll<HTMLElement>('[data-reveal-item]').forEach((item) => {
        item.style.opacity = '0';
      });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const section = entry.target as HTMLElement;
          observer.unobserve(section);

          animate(section, {
            opacity: { to: 1, duration: 600 },
            translateY: { to: 0, duration: 700, ease: 'out(3)' },
          });

          const items = section.querySelectorAll<HTMLElement>('[data-reveal-item]');
          if (items.length) {
            animate(items, {
              opacity: { from: 0, to: 1, duration: 400 },
              translateY: { from: 12, to: 0, duration: 500, ease: 'out(3)' },
              delay: stagger(40, { start: 200 }),
            });
          }
        });
      },
      { root: container, threshold: 0.15 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [root]);
};
