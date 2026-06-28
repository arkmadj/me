import { useEffect, useRef, useState } from "react";
import {
  animate,
  createScope,
  createDraggable,
  spring,
  scrambleText,
} from "animejs";
import { useGame } from "@/context";

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
  const ballVelocity = useRef({ vx: 0, vy: 0 });
  const ballPosition = useRef({ x: 0, y: 0 });
  const bat = useRef<HTMLDivElement | null>(null);
  const batPosition = useRef(0); // Position in pixels from center
  const keysPressed = useRef<Set<string>>(new Set());
  const batAnimationFrame = useRef<number | null>(null);
  const isTouching = useRef(false);
  const touchStartX = useRef(0);
  const [showBat, setShowBat] = useState<boolean>(false);
  const { gameState, setGameState } = useGame();
  const gameStateRef = useRef(gameState);
  const welcomeAnimationComplete = useRef(false);

  // Welcome text as individual characters
  const welcomeText = "WELCOME TO THE MAYTRICKS";
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const charPositions = useRef<{ x: number; y: number; rotation: number }[]>(
    Array(welcomeText.length)
      .fill(null)
      .map(() => ({ x: 0, y: 0, rotation: 0 })),
  );
  const charVelocities = useRef<{ vx: number; vy: number; vr: number }[]>(
    Array(welcomeText.length)
      .fill(null)
      .map(() => ({ vx: 0, vy: 0, vr: 0 })),
  );
  const charHit = useRef<boolean[]>(Array(welcomeText.length).fill(false));

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

            setShowBat(true);
            setGameState("running");

            // Calculate drag distance
            const dragX = dragEnd.current.x - dragStart.current.x;
            const dragY = dragEnd.current.y - dragStart.current.y;

            // Calculate catapult velocity (launch in opposite direction)
            const velocityMultiplier = 1.5;
            let velocityX = -dragX * velocityMultiplier;
            let velocityY = -dragY * velocityMultiplier;

            // Clamp velocity to maximum and minimum speed
            const maxSpeed = window.innerWidth > 1920 ? 8 : 8; // Maximum pixels per frame
            const minSpeed = 6; // Minimum pixels per frame
            const currentSpeed = Math.sqrt(
              velocityX * velocityX + velocityY * velocityY,
            );
            if (currentSpeed > maxSpeed) {
              const scale = maxSpeed / currentSpeed;
              velocityX *= scale;
              velocityY *= scale;
            } else if (currentSpeed < minSpeed && currentSpeed > 0) {
              const scale = minSpeed / currentSpeed;
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

            const ballSize = window.innerWidth < 768 ? 32 : 40; // Size of the ball in pixels
            const batWidth = window.innerWidth / 6;
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
              // Check if game is paused
              if (gameStateRef.current === "paused") {
                // Store current state and continue checking (so we can resume)
                ballPosition.current = { x: currentX, y: currentY };
                ballVelocity.current = { vx: velocityX, vy: velocityY };
                animationFrame.current = requestAnimationFrame(animateBounce);
                return;
              }

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

                // Clamp total velocity to max and min speed
                const currentSpeed = Math.sqrt(
                  velocityX * velocityX + velocityY * velocityY,
                );
                const maxSpeed = window.innerWidth > 1920 ? 8 : 8;
                const minSpeed = 6; // Minimum pixels per frame
                if (currentSpeed > maxSpeed) {
                  const scale = maxSpeed / currentSpeed;
                  velocityX *= scale;
                  velocityY *= scale;
                } else if (currentSpeed < minSpeed && currentSpeed > 0) {
                  const scale = minSpeed / currentSpeed;
                  velocityX *= scale;
                  velocityY *= scale;
                }
              }

              // Check collision with characters
              charRefs.current.forEach((charEl, i) => {
                if (!charEl) return;

                // Skip if character has already been hit
                if (charHit.current[i]) return;

                const charRect = charEl.getBoundingClientRect();
                const screenCenterX = screenWidth / 2;
                const screenCenterY = screenHeight / 2;

                // Convert character position to center-based coordinates
                const charCenterX =
                  charRect.left + charRect.width / 2 - screenCenterX;
                const charCenterY =
                  charRect.top + charRect.height / 2 - screenCenterY;

                // Check if ball overlaps with character
                const dx = currentX - charCenterX;
                const dy = currentY - charCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const charRadius =
                  Math.max(charRect.width, charRect.height) / 2;

                if (distance < ballSize / 2 + charRadius) {
                  // Collision detected! Mark as hit and make character start falling
                  charHit.current[i] = true;
                  charVelocities.current[i].vy = 2;

                  // Deflect the ball away from the character
                  const angle = Math.atan2(dy, dx);
                  const speed = Math.sqrt(
                    velocityX * velocityX + velocityY * velocityY,
                  );
                  velocityX = Math.cos(angle) * speed;
                  velocityY = Math.sin(angle) * speed;
                }
              });

              // Update character positions with physics
              charRefs.current.forEach((charEl, i) => {
                if (!charEl) return;

                // Only apply physics if character is falling
                if (charVelocities.current[i].vy > 0) {
                  const gravity = 0.001;

                  // Apply gravity
                  charVelocities.current[i].vy += gravity;

                  // Update position
                  charPositions.current[i].y += charVelocities.current[i].vy;

                  // Check if hit the ground (bottom of screen)
                  const charMaxY = screenHeight;

                  if (charPositions.current[i].y >= charMaxY) {
                    // Stop at the ground
                    charPositions.current[i].y = charMaxY;
                    charVelocities.current[i].vy = 0;
                  }

                  // Apply transform
                  charEl.style.transform = `translate(${charPositions.current[i].x}px, ${charPositions.current[i].y}px)`;
                }
              });

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

              // Store current state for pause/resume
              ballPosition.current = { x: currentX, y: currentY };
              ballVelocity.current = { vx: velocityX, vy: velocityY };

              // Update ball and draggable position
              if (ball.current && ballDraggable.current) {
                // Update the visual position
                (ball.current as HTMLElement).style.transform =
                  `translate(${currentX}px, ${currentY}px)`;

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

        // Initially disable dragging until welcome animation completes
        if (ballDraggable.current) {
          ballDraggable.current.disable();
        }
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

      // Animate individual characters appearing
      charRefs.current.forEach((charEl, index) => {
        if (charEl) {
          animate(charEl, {
            opacity: {
              from: 0,
              to: 1,
              duration: 50,
              delay: 2500 + index * 50,
            },
          });
        }
      });
    });

    // Calculate when the welcome animation completes
    // Intro: 600ms delay + 2000ms duration = 2600ms
    // Characters: 2500ms start + (24 chars * 50ms) + 50ms duration = 3750ms
    const welcomeAnimationDuration = 3750;

    // Enable ball dragging after welcome animation completes
    const enableDraggingTimer = setTimeout(() => {
      welcomeAnimationComplete.current = true;
      if (ballDraggable.current) {
        ballDraggable.current.enable();
      }
    }, welcomeAnimationDuration);

    return () => {
      scope.current?.revert();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      clearTimeout(enableDraggingTimer);
    };
  }, []);

  const updateBatPosition = () => {
    if (!bat.current) return;

    const moveSpeed = window.innerWidth < 768 ? 5 : 7; // Pixels per frame for smooth movement
    const batWidth = window.innerWidth < 768 ? 80 : 160; // max-md:w-20 = 80px, w-40 = 160px
    const screenWidth = window.innerWidth;
    const maxPosition = screenWidth / 2 - batWidth / 2;
    const minPosition = -screenWidth / 2 + batWidth / 2;

    let moved = false;

    // Update position based on which keys are pressed
    if (keysPressed.current.has("ArrowLeft")) {
      batPosition.current = Math.max(
        minPosition,
        batPosition.current - moveSpeed,
      );
      moved = true;
    }
    if (keysPressed.current.has("ArrowRight")) {
      batPosition.current = Math.min(
        maxPosition,
        batPosition.current + moveSpeed,
      );
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

  const launchBall = () => {
    if (!ball.current) return;

    setShowBat(true);
    setGameState("running");

    // Disable dragging during animation
    isAnimating.current = true;
    if (ballDraggable.current) {
      ballDraggable.current.disable();
    }

    // Physics simulation with bouncing (infinite)
    // Default launch from center with upward velocity
    let currentX = 0;
    let currentY = 0;
    let velocityX = 3;
    let velocityY = -7;

    const ballSize = window.innerWidth < 768 ? 32 : 40;
    const batWidth = window.innerWidth < 768 ? 80 : 160;
    const batHeight = 24;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const maxX = screenWidth / 2 - ballSize / 2;
    const minX = -screenWidth / 2 + ballSize / 2;
    const maxY = screenHeight / 2 - ballSize / 2;
    const minY = -screenHeight / 2 + ballSize / 2;

    const batY = screenHeight / 2 - 24 - batHeight / 2;

    const animateBounce = () => {
      // Check if game is paused
      if (gameStateRef.current === "paused") {
        // Store current state and continue checking (so we can resume)
        ballPosition.current = { x: currentX, y: currentY };
        ballVelocity.current = { vx: velocityX, vy: velocityY };
        animationFrame.current = requestAnimationFrame(animateBounce);
        return;
      }

      // Update position
      currentX += velocityX;
      currentY += velocityY;

      const ballBottom = currentY + ballSize / 2;
      const ballTop = currentY - ballSize / 2;
      const ballLeft = currentX - ballSize / 2;
      const ballRight = currentX + ballSize / 2;

      const batLeft = batPosition.current - batWidth / 2;
      const batRight = batPosition.current + batWidth / 2;
      const batTop = batY - batHeight / 2;
      const batBottom = batY + batHeight / 2;

      if (
        ballBottom >= batTop &&
        ballTop <= batBottom &&
        ballRight >= batLeft &&
        ballLeft <= batRight &&
        velocityY > 0
      ) {
        currentY = batTop - ballSize / 2;
        velocityY = -Math.abs(velocityY);

        const batCenter = batPosition.current;
        const hitOffset = currentX - batCenter;
        const maxOffset = batWidth / 2;
        const angleFactor = hitOffset / maxOffset;

        velocityX += angleFactor * 2;

        const currentSpeed = Math.sqrt(
          velocityX * velocityX + velocityY * velocityY,
        );
        const maxSpeed = window.innerWidth > 1920 ? 8 : 8;
        const minSpeed = 6;
        if (currentSpeed > maxSpeed) {
          const scale = maxSpeed / currentSpeed;
          velocityX *= scale;
          velocityY *= scale;
        } else if (currentSpeed < minSpeed && currentSpeed > 0) {
          const scale = minSpeed / currentSpeed;
          velocityX *= scale;
          velocityY *= scale;
        }
      }

      charRefs.current.forEach((charEl, i) => {
        if (!charEl) return;
        if (charHit.current[i]) return;

        const charRect = charEl.getBoundingClientRect();
        const screenCenterX = screenWidth / 2;
        const screenCenterY = screenHeight / 2;

        const charCenterX = charRect.left + charRect.width / 2 - screenCenterX;
        const charCenterY = charRect.top + charRect.height / 2 - screenCenterY;

        const dx = currentX - charCenterX;
        const dy = currentY - charCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const charRadius = Math.max(charRect.width, charRect.height) / 2;

        if (distance < ballSize / 2 + charRadius) {
          charHit.current[i] = true;
          charVelocities.current[i].vy = 2;

          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(
            velocityX * velocityX + velocityY * velocityY,
          );
          velocityX = Math.cos(angle) * speed;
          velocityY = Math.sin(angle) * speed;
        }
      });

      charRefs.current.forEach((charEl, i) => {
        if (!charEl) return;

        if (charVelocities.current[i].vy > 0) {
          const gravity = 0.001;

          charVelocities.current[i].vy += gravity;
          charPositions.current[i].y += charVelocities.current[i].vy;

          const charMaxY = screenHeight;

          if (charPositions.current[i].y >= charMaxY) {
            charPositions.current[i].y = charMaxY;
            charVelocities.current[i].vy = 0;
          }

          charEl.style.transform = `translate(${charPositions.current[i].x}px, ${charPositions.current[i].y}px)`;
        }
      });

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

      // Store current state for pause/resume
      ballPosition.current = { x: currentX, y: currentY };
      ballVelocity.current = { vx: velocityX, vy: velocityY };

      if (ball.current && ballDraggable.current) {
        (ball.current as HTMLElement).style.transform =
          `translate(${currentX}px, ${currentY}px)`;
        ballDraggable.current.x = currentX;
        ballDraggable.current.y = currentY;
      }

      animationFrame.current = requestAnimationFrame(animateBounce);
    };

    animationFrame.current = requestAnimationFrame(animateBounce);
  };

  // Sync gameState to ref so animation loop can access it
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();

        const wasEmpty = keysPressed.current.size === 0;
        keysPressed.current.add(e.key);

        // Start animation loop if not already running
        if (wasEmpty && !batAnimationFrame.current) {
          batAnimationFrame.current = requestAnimationFrame(updateBatPosition);
        }
      } else if (e.key === " ") {
        e.preventDefault();

        // Only allow space actions after welcome animation completes
        if (!welcomeAnimationComplete.current) {
          return;
        }

        if (gameState === "new") {
          // Launch the ball if game is new
          launchBall();
        } else if (gameState === "running") {
          // Pause the game if it's running
          setGameState("paused");
        } else if (gameState === "paused") {
          // Resume the game if it's paused (just change state, animation loop will continue)
          setGameState("running");
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
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

      batPosition.current = Math.max(
        minPosition,
        Math.min(maxPosition, relativeX),
      );
      bat.current.style.transform = `translateX(${batPosition.current}px)`;
    };

    const handleTouchEnd = () => {
      isTouching.current = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
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
          className='text-3xl max-md:text-2xl text-green-400 font-mono font-bold tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] relative'
        >
          {welcomeText.split("").map((char, index) => {
            // Skip spaces - don't render them
            if (char === " ") {
              return (
                <span
                  key={index}
                  style={{ display: "inline-block", width: "0.5em" }}
                ></span>
              );
            }

            return (
              <span
                key={index}
                ref={(el) => {
                  charRefs.current[index] = el;
                }}
                className='inline-block'
                style={{
                  display: "inline-block",
                  opacity: 0,
                }}
              >
                {char}
              </span>
            );
          })}
        </h1>
      </div>

      <div className='absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
        <div
          ref={ball}
          className='size-8 rounded-full bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] pointer-events-auto'
        />
      </div>
      <div
        ref={bat}
        className='w-1/6 max-md:w-20 h-6 bg-green-500 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.6)] absolute bottom-6 left-1/2 -translate-x-1/2 origin-bottom'
        style={{ transform: showBat ? "scale(1)" : "scale(0)" }}
      />
    </main>
  );
};

export default Home;
