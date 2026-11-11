import { forwardRef, useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/hooks/useReveal';
import { getRainQuality } from './matrixQuality';

interface MatrixRainProps {
  className?: string;
}

// Matrix characters - katakana, latin letters, and numbers
const CHARS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '0123456789';

const MatrixRain = forwardRef<HTMLCanvasElement, MatrixRainProps>(
  ({ className = '' }, ref) => {
    const internalRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = internalRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fewer columns and frames on low-end devices (few cores, little memory, Save-Data)
      const { fps, fontSize } = getRainQuality(globalThis.navigator);
      const frameInterval = 1000 / fps;
      const reduceMotion = prefersReducedMotion();

      // y position (in rows) of each column's leading character
      let drops: number[] = [];

      const setup = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Resizing the canvas resets its state, so restore it
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px monospace`;

        const columns = Math.ceil(canvas.width / fontSize);
        // Keep existing columns where they are; only seed new ones
        drops = Array.from({ length: columns }, (_, i) => drops[i] ?? Math.random() * -100);
      };

      const draw = () => {
        // Semi-transparent black to create fade effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bright green for leading character
        ctx.fillStyle = '#0F0';
        for (let i = 0; i < drops.length; i++) {
          const char = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);

          // Reset drop to top randomly
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      };

      // Reduced motion: run the rain forward once and leave it as a still frame
      const paintStill = () => {
        for (let frame = 0; frame < 120; frame++) draw();
      };

      setup();

      if (reduceMotion) {
        paintStill();
        const handleResize = () => {
          setup();
          paintStill();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      }

      // A timer at the target rate rather than a rAF loop: rAF would wake the renderer
      // every vsync (60-120Hz) just to skip most frames, which measured slower.
      let visible = true;
      const interval = setInterval(() => {
        if (visible && !document.hidden) draw();
      }, frameInterval);

      // Stop drawing while the canvas is scrolled offscreen
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      observer.observe(canvas);

      window.addEventListener('resize', setup);

      return () => {
        clearInterval(interval);
        observer.disconnect();
        window.removeEventListener('resize', setup);
      };
    }, []);

    return (
      <canvas
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.RefObject<HTMLCanvasElement | null>).current = node;
          }
        }}
        className={className}
      />
    );
  }
);

MatrixRain.displayName = 'MatrixRain';

export default MatrixRain;
