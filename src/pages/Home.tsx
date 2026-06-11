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
  const ballDraggable = useRef<ReturnType<typeof createDraggable> | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragEnd = useRef({ x: 0, y: 0 });
  const isAnimating = useRef(false);
  const animationFrame = useRef<number | null>(null);

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

        ballDraggable.current = createDraggable(ball.current, {
          container: [0, 0, 0, 0],
          onGrab: (draggable) => {
            // Cancel any ongoing bounce animation
            if (animationFrame.current) {
              cancelAnimationFrame(animationFrame.current);
              animationFrame.current = null;
            }

            isAnimating.current = false;

            dragStart.current = {
              x: draggable.x,
              y: draggable.y,
            };
          },
          onRelease: (draggable) => {
            dragEnd.current = {
              x: draggable.x,
              y: draggable.y,
            };

            // Calculate drag distance
            const dragX = dragEnd.current.x - dragStart.current.x;
            const dragY = dragEnd.current.y - dragStart.current.y;

            // Calculate catapult velocity (launch in opposite direction)
            const velocityMultiplier = 1.5;
            let velocityX = -dragX * velocityMultiplier;
            let velocityY = -dragY * velocityMultiplier;

            // Clamp velocity to maximum speed
            const maxSpeed = 4; // Maximum pixels per frame
            const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
            if (currentSpeed > maxSpeed) {
              const scale = maxSpeed / currentSpeed;
              velocityX *= scale;
              velocityY *= scale;
            }

            // Disable dragging during animation
            isAnimating.current = true;
            if (ballDraggable.current) {
              ballDraggable.current.disable();
            }

            // Physics simulation with bouncing (infinite)
            let currentX = dragEnd.current.x;
            let currentY = dragEnd.current.y;

            const ballSize = 40; // Size of the ball in pixels
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Calculate boundaries (relative to center)
            const maxX = screenWidth / 2 - ballSize / 2;
            const minX = -screenWidth / 2 + ballSize / 2;
            const maxY = screenHeight / 2 - ballSize / 2;
            const minY = -screenHeight / 2 + ballSize / 2;

            const animateBounce = () => {
              // Update position (no friction - constant velocity)
              currentX += velocityX;
              currentY += velocityY;

              // Check boundaries and bounce (perfect elastic collision)
              if (currentX > maxX) {
                currentX = maxX;
                velocityX = -Math.abs(velocityX);
              } else if (currentX < minX) {
                currentX = minX;
                velocityX = Math.abs(velocityX);
              }

              if (currentY > maxY) {
                currentY = maxY;
                velocityY = -Math.abs(velocityY);
              } else if (currentY < minY) {
                currentY = minY;
                velocityY = Math.abs(velocityY);
              }

              // Update ball and draggable position
              if (ball.current && ballDraggable.current) {
                // Update the visual position
                (ball.current as HTMLElement).style.transform = `translate(${currentX}px, ${currentY}px)`;

                // Keep draggable in sync
                ballDraggable.current.x = currentX;
                ballDraggable.current.y = currentY;
              }

              // Continue animation infinitely
              animationFrame.current = requestAnimationFrame(animateBounce);
            };

            // Start the animation
            animationFrame.current = requestAnimationFrame(animateBounce);
          },
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

    return () => {
      scope.current?.revert();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
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
        ></h1>
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
