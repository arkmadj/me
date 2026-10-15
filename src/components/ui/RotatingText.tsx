import { cn } from '@/lib/utils';
import { useRotatingText } from '@/hooks/useRotatingText';

interface RotatingTextProps {
  items: readonly string[];
  active?: boolean;
  className?: string;
  cursorClassName?: string;
  /** Reserve the space of the longest item so wrapping text doesn't shift surrounding layout. */
  reserveSpace?: boolean;
}

/**
 * Terminal-style rotating text. Kept as its own component so the per-keystroke
 * re-renders stay local instead of re-rendering the parent.
 */
export const RotatingText = ({ items, active, className, cursorClassName, reserveSpace }: RotatingTextProps) => {
  const text = useRotatingText(items, active);

  const visible = (
    <>
      <span aria-hidden className={className}>
        {text}
      </span>
      <span aria-hidden className={cn('animate-pulse', className, cursorClassName)}>
        ▌
      </span>
    </>
  );

  return (
    <>
      {reserveSpace ? (
        // Every item is stacked invisibly in the same grid cell, so the box is always
        // as wide/tall as the longest one, whatever is currently typed.
        <span className='inline-grid align-top'>
          {items.map((item) => (
            <span key={item} aria-hidden className={cn('invisible col-start-1 row-start-1', className)}>
              {item}▌
            </span>
          ))}
          <span className='col-start-1 row-start-1'>{visible}</span>
        </span>
      ) : (
        visible
      )}
      <span className='sr-only'>{items.join(', ')}</span>
    </>
  );
};
