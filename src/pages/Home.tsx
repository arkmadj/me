import { useEffect, useRef } from "react";
import {
  animate,
  stagger,
  splitText,
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
      // Split the text after the component has mounted
      if (welcome.current) {
        const { chars } = splitText(welcome.current, {
          words: false,
          chars: true,
        });

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
      }

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

      if (ball.current) {
        createDraggable(ball.current, {
          container: [0, 0, 0, 0],
          releaseEase: spring({ bounce: 0.7 }),
        });
      }
    });

    return () => scope.current?.revert();
  }, []);

  return (
    <main
      ref={root}
      className='relative z-10 h-full flex flex-col justify-center items-center pointer-events-none'
    >
      <div className='flex items-center justify-center pt-4'>
        <p ref={intro} className='text-green-400 font-mono text-lg mb-2'>
          Hello, I am Ahmad Jinadu
        </p>
      </div>
      <div className='grid flex-1 place-items-center'>
        <h1
          ref={welcome}
          className='text-3xl max-md:text-2xl text-green-400 font-mono font-bold tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'
        >
          WELCOME TO THE MATRICKS
        </h1>
      </div>

      <div className='flex-1'>
        <div
          ref={ball}
          className='size-10 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] pointer-events-auto'
        />
      </div>
    </main>
  );
};

export default Home;
