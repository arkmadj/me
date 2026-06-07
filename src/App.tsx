import {
  animate,
  stagger,
  splitText,
  createScope,
  createDraggable,
  spring,
  scrambleText,
} from "animejs";
import "@/App.css";
import { useEffect, useRef, useState } from "react";

function App() {
  const root = useRef(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const cursorTracker = useRef(null);
  const textCursorOne = useRef(null);
  const intro = useRef(null);
  const greetings = useRef(null);
  const [gridSize, setGridSize] = useState({ cols: 24, rows: 24 });

  useEffect(() => {
    const calculateGrid = () => {
      const minCellSize = 50; // Minimum cell size in pixels
      const cols = Math.floor(window.innerWidth / minCellSize);
      const rows = Math.floor(window.innerHeight / minCellSize);
      setGridSize({ cols, rows });
    };

    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, []);

  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({ root: root.current }).add(() => {
      // Split the text after the component has mounted
      const { chars } = splitText("h1", { words: false, chars: true });

      // Typing effect for intro
      if (intro.current) {
        animate(intro.current, {
          innerHTML: scrambleText({
            cursor: "█",
            override: " ",
            duration: 2000,
          }),
        });
      }

      if (greetings.current) {
        animate(greetings.current, {
          innerHTML: scrambleText({
            text: "How are you",
            cursor: "█",
            override: " ",
            duration: 2000,
            delay: 2500,
          }),
        });
      }

      // Existing h1 animation (starts after both intro and greeting finish)
      animate(chars, {
        // Property keyframes
        y: [
          { to: "-2.75rem", ease: "outExpo", duration: 600 },
          { to: 0, ease: "outBounce", duration: 800, delay: 100 },
        ],
        // Property specific parameters
        rotate: {
          from: "-1turn",
          delay: 700,
        },
        delay: stagger(50, { from: 0, start: 100 }),
        ease: "inOutCirc",
        loopDelay: 1000,
        loop: true,
      });

      createDraggable("#ball", {
        container: [0, 0, 0, 0],
        releaseEase: spring({ bounce: 0.7 }),
      });
    });

    return () => scope.current?.revert();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorTracker.current) {
        animate(cursorTracker.current, {
          left: e.clientX,
          top: e.clientY,
          ease: "out(3)",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main
      ref={root}
      className='h-svh w-full bg-[#0a0f0a] relative overflow-hidden isolate'
    >
      <div
        ref={cursorTracker}
        className='absolute pointer-events-none z-0 w-0 h-0'
      >
        <div className='absolute -translate-x-1/2 -translate-y-1/2 bg-green-500 size-96 rounded-full blur-3xl opacity-60' />
        <div className='absolute -translate-x-1/2 -translate-y-1/2 bg-green-400 size-64 rounded-full blur-2xl opacity-50' />
        <div className='absolute -translate-x-1/2 -translate-y-1/2 bg-green-300 size-40 rounded-full blur-xl opacity-40' />
      </div>

      <div
        className='absolute inset-0 grid gap-px z-10'
        style={{
          gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize.cols * gridSize.rows }).map((_, i) => (
          <div
            key={i}
            className='aspect-square bg-black border border-green-950/30'
            onClick={() => console.log(`Cell ${i} clicked`)}
          />
        ))}
      </div>

      <div className='relative z-10 h-full flex flex-col justify-center items-center pointer-events-none'>
        <div className='flex items-center justify-center pt-4'>
          <p ref={intro} className='text-green-400 font-mono text-lg mb-2'>
            Hello, I am Ahmad Jinadu
          </p>
        </div>
        <div className='grid flex-1 place-items-center'>
          <h1 className='text-3xl max-md:text-2xl text-green-400 font-mono font-bold tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'>
            WELCOME TO THE MATRICKS
          </h1>
        </div>

        <div className='flex-1'>
          <div
            id='ball'
            className='size-10 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] pointer-events-auto'
          />
        </div>
      </div>
    </main>
  );
}

export default App;
