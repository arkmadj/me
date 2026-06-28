import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

const WorkInProgress = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix characters - katakana, latin letters, and numbers
    const katakana = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const nums = '0123456789';
    const chars = katakana + latin + nums;

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    // Array to track y position of each column
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100; // Start at random positions above screen
    }

    const draw = () => {
      // Semi-transparent black to create fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Random character
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Bright green for leading character
        ctx.fillStyle = '#0F0';
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        // Reset drop to top randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33); // ~30fps

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='relative z-10 h-full overflow-hidden'>
      {/* Matrix background */}
      <canvas
        ref={canvasRef}
        className='absolute inset-0 z-0'
      />
      
      {/* Content overlay */}
      <main className='relative z-10 h-full flex flex-col items-center justify-center gap-6'>
        <h1 className='text-6xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'>
          WIP
        </h1>
        <p className='text-green-400 font-mono text-lg text-center px-4'>
          This part of the matrix is still being compiled...
        </p>
        <Link
          to={ROUTES.HOME}
          className='text-green-400 font-mono text-sm tracking-wider border border-green-400 px-6 py-3 rounded hover:bg-green-400 hover:text-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]'
        >
          Return to Reality
        </Link>
      </main>
    </div>
  );
};

export default WorkInProgress;
