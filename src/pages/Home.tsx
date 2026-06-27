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
  const bat = useRef<HTMLDivElement | null>(null);
  const batPosition = useRef(0); // Position in pixels from center
  const keysPressed = useRef<Set<string>>(new Set());
  const batAnimationFrame = useRef<number | null>(null);
  const isTouching = useRef(false);
  const touchStartX = useRef(0);

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
            const maxSpeed = 5; // Maximum pixels per frame
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
            const batWidth = window.innerWidth < 768 ? 80 : 160; // max-md:w-20 = 80px, w-40 = 160px
            const batHeight = 24; // h-6 = 1.5rem = 24px
            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;

            // Calculate boundaries (relative to center)
            const maxX = screenWidth / 2 - ballSize / 2;
            const minX = -screenWidth / 2 + ballSize / 2;
            const maxY = screenHeight / 2 - ballSize / 2;
            const minY = -screenHeight / 2 + ballSize / 2;

            // Bat position (bottom-6 = 1.5rem = 24px from bottom)
            const batY = screenHeight / 2 - 24 - batHeight / 2;

            const animateBounce = () => {
              // Update position (no friction - constant velocity)
              currentX += velocityX;
              currentY += velocityY;

              // Check bat collision
              const ballBottom = currentY + ballSize / 2;
              const ballTop = currentY - ballSize / 2;
              const ballLeft = currentX - ballSize / 2;
              const ballRight = currentX + ballSize / 2;

              const batLeft = batPosition.current - batWidth / 2;
              const batRight = batPosition.current + batWidth / 2;
              const batTop = batY - batHeight / 2;
              const batBottom = batY + batHeight / 2;

              // Check if ball collides with bat
              if (
                ballBottom >= batTop &&
                ballTop <= batBottom &&
                ballRight >= batLeft &&
                ballLeft <= batRight &&
                velocityY > 0 // Ball is moving downward
              ) {
                // Collision detected!
                currentY = batTop - ballSize / 2; // Position ball just above bat

                // Reverse Y velocity and add some bounce
                velocityY = -Math.abs(velocityY);

                // Add horizontal velocity based on where ball hit the bat
                const batCenter = batPosition.current;
                const hitOffset = currentX - batCenter;
                const maxOffset = batWidth / 2;
                const angleFactor = hitOffset / maxOffset; // -1 to 1

                // Add spin to the ball based on hit position
                velocityX += angleFactor * 2;

                // Clamp total velocity to max speed
                const currentSpeed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
                const maxSpeed = 10;
                if (currentSpeed > maxSpeed) {
                  const scale = maxSpeed / currentSpeed;
                  velocityX *= scale;
                  velocityY *= scale;
                }
              }

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

  const updateBatPosition = () => {
    if (!bat.current) return;

    const moveSpeed = 5; // Pixels per frame for smooth movement
    const batWidth = window.innerWidth < 768 ? 80 : 160; // max-md:w-20 = 80px, w-40 = 160px
    const screenWidth = window.innerWidth;
    const maxPosition = screenWidth / 2 - batWidth / 2;
    const minPosition = -screenWidth / 2 + batWidth / 2;

    let moved = false;

    // Update position based on which keys are pressed
    if (keysPressed.current.has('ArrowLeft')) {
      batPosition.current = Math.max(minPosition, batPosition.current - moveSpeed);
      moved = true;
    }
    if (keysPressed.current.has('ArrowRight')) {
      batPosition.current = Math.min(maxPosition, batPosition.current + moveSpeed);
      moved = true;
    }

    // Apply the new position with smooth transform
    if (moved) {
      bat.current.style.transform = `translateX(${batPosition.current}px)`;
    }

    // Continue animation loop if any keys are pressed
    if (keysPressed.current.size > 0) {
      batAnimationFrame.current = requestAnimationFrame(updateBatPosition);
    } else {
      batAnimationFrame.current = null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();

        const wasEmpty = keysPressed.current.size === 0;
        keysPressed.current.add(e.key);

        // Start animation loop if not already running
        if (wasEmpty && !batAnimationFrame.current) {
          batAnimationFrame.current = requestAnimationFrame(updateBatPosition);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keysPressed.current.delete(e.key);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (!bat.current) return;

      const touch = e.touches[0];
      isTouching.current = true;
      touchStartX.current = touch.clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!bat.current || !isTouching.current) return;

      e.preventDefault();

      const touch = e.touches[0];
      const touchX = touch.clientX;

      // Calculate bat position based on touch position
      // Convert screen coordinates to center-based coordinates
      const screenWidth = window.innerWidth;
      const centerX = screenWidth / 2;
      const relativeX = touchX - centerX;

      // Clamp to boundaries
      const batWidth = window.innerWidth < 768 ? 80 : 160;
      const maxPosition = screenWidth / 2 - batWidth / 2;
      const minPosition = -screenWidth / 2 + batWidth / 2;

      batPosition.current = Math.max(minPosition, Math.min(maxPosition, relativeX));
      bat.current.style.transform = `translateX(${batPosition.current}px)`;
    };

    const handleTouchEnd = () => {
      isTouching.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      if (batAnimationFrame.current) {
        cancelAnimationFrame(batAnimationFrame.current);
      }
    };
  });

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
      <div
        ref={bat}
        className="w-40 max-md:w-20 h-6 bg-green-500 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.6)] absolute bottom-6 left-1/2 -translate-x-1/2"
      />
    </main>
  );
};

export default Home;
