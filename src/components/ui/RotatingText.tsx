import { cn } from '@/lib/utils';
import { useRotatingText } from '@/hooks/useRotatingText';

interface RotatingTextProps {
  items: readonly string[];
  active?: boolean;
  className?: string;
  cursorClassName?: string;
}

/**
 * Terminal-style rotating text. Kept as its own component so the per-keystroke
 * re-renders stay local instead of re-rendering the parent.
 */
export const RotatingText = ({ items, active, className, cursorClassName }: RotatingTextProps) => {
  const text = useRotatingText(items, active);

  return (
    <>
      <span aria-hidden className={className}>
        {text}
      </span>
      <span aria-hidden className={cn('animate-pulse', className, cursorClassName)}>
        ▌
      </span>
      <span className='sr-only'>{items.join(', ')}</span>
    </>
  );
};
