import { useEffect, useRef } from "react";
import {
  animate,
  createScope,
  createDraggable,
  spring,
  scrambleText,
} from "animejs";

const Home = () => {
  const root = useRef(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const intro = useRef(null);
  const welcome = useRef(null);
  const ball = useRef(null);
  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({ root: root.current }).add(() => {
      if (ball.current) {
        animate(ball.current, {
          scale: {
            from: 40,
            ease: spring({ bounce: 0.2, duration: 500 }),
          },
        });
        createDraggable(ball.current, {
          container: [0, 0, 0, 0],
          releaseEase: spring({ bounce: 0.7 }),
        });
      }

      // Typing effect for intro
      if (intro.current) {
        animate(intro.current, {
          innerHTML: scrambleText({
            text: "Hello, I am Ahmad Jinadu",
            cursor: "█",
            override: " ",
            duration: 2000,
            delay: 600,
          }),
        });
      }

      if (welcome.current) {
        animate(welcome.current, {
          innerHTML: scrambleText({
            text: "WELCOME TO THE MAYTRICKS",
            cursor: "█",
            override: " ",
            duration: 2000,
            delay: 2500,
          }),
        });
      }
    });

    return () => scope.current?.revert();
  }, []);

  return (
    <main
      ref={root}
      className='relative z-10 h-full flex flex-col pointer-events-none'
    >
      <div className='flex items-center justify-center pt-4'>
        <p ref={intro} className='text-green-400 font-mono text-lg mb-2'></p>
      </div>
      <div className='grid place-items-center mt-52'>
        <h1
          ref={welcome}
          className='text-3xl max-md:text-2xl text-green-400 font-mono font-bold tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'
        >
        </h1>
      </div>

      <div className='absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
        <div
          ref={ball}
          className='size-10 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] pointer-events-auto'
        />
      </div>
    </main>
  );
};

export default Home;
