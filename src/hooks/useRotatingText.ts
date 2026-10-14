import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/hooks/useReveal';

const TYPE_MS = 70;
const DELETE_MS = 35;
const HOLD_MS = 2200;
const REDUCED_HOLD_MS = 3000;

/** Types out each item, holds it, then deletes it before moving to the next. */
export const useRotatingText = (items: readonly string[], active = true) => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(items[0]);
  const [deleting, setDeleting] = useState(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!active || items.length < 2) return;
    const target = items[index];

    if (reduced) {
      const timeout = setTimeout(() => {
        const next = (index + 1) % items.length;
        setIndex(next);
        setText(items[next]);
      }, REDUCED_HOLD_MS);
      return () => clearTimeout(timeout);
    }

    let delay = deleting ? DELETE_MS : TYPE_MS;
    let step: () => void;
    if (!deleting && text === target) {
      delay = HOLD_MS;
      step = () => setDeleting(true);
    } else if (deleting && text === '') {
      delay = TYPE_MS;
      step = () => {
        setDeleting(false);
        setIndex((index + 1) % items.length);
      };
    } else {
      step = () => setText(deleting ? text.slice(0, -1) : target.slice(0, text.length + 1));
    }

    const timeout = setTimeout(step, delay);
    return () => clearTimeout(timeout);
  }, [items, index, text, deleting, active, reduced]);

  return text;
};
