import { useRef } from 'react';
import { animate, scrambleText } from 'animejs';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/hooks/useReveal';

interface DecryptTextProps {
  text: string;
  className?: string;
}

/** Text that briefly scrambles back into the Matrix when hovered. */
export const DecryptText = ({ text, className }: DecryptTextProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const running = useRef(false);

  const decrypt = () => {
    if (!ref.current || running.current || prefersReducedMotion()) return;
    running.current = true;
    animate(ref.current, {
      innerHTML: scrambleText({ text, chars: 'アカサタナ01#%', duration: 450 }),
      onComplete: () => {
        running.current = false;
      },
    });
  };

  return (
    <span ref={ref} onMouseEnter={decrypt} className={cn('inline-block', className)}>
      {text}
    </span>
  );
};
