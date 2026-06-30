import { useEffect, useRef, useCallback } from "react";
import {
  animate,
  createScope,
  createDraggable,
  spring,
  scrambleText,
} from "animejs";
import { useGame } from "@/context";
import { WELCOME_TEXT, INTRO_TEXT, ANIMATION_TIMINGS } from "./constants";
import { useBallAnimation } from "./hooks/useBallAnimation";
import { useBatControls } from "./hooks/useBatControls";
import { useGameControls } from "./hooks/useGameControls";
import { AnimatedText } from "./components/AnimatedText";
import { Ball } from "./components/Ball";
import { Bat } from "./components/Bat";
import { isDeepEqual } from "@/lib/utils";

const Home = () => {
  // Refs for DOM elements
  const root = useRef<HTMLDivElement | null>(null);
  const intro = useRef<HTMLParagraphElement | null>(null);
  const ball = useRef<HTMLDivElement | null>(null);
  const bat = useRef<HTMLDivElement | null>(null);

  // Refs for animation state
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const ballDraggable = useRef<ReturnType<typeof createDraggable> | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragEnd = useRef({ x: 0, y: 0 });
  const isAnimating = useRef(false);
  const welcomeAnimationComplete = useRef(false);

  // Character refs and state
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const charPositions = useRef<{ x: number; y: number; rotation: number }[]>(
    Array(WELCOME_TEXT.length)
      .fill(null)
      .map(() => ({ x: 0, y: 0, rotation: 0 })),
  );
  const charVelocities = useRef<{ vx: number; vy: number; vr: number }[]>(
    Array(WELCOME_TEXT.length)
      .fill(null)
      .map(() => ({ vx: 0, vy: 0, vr: 0 })),
  );
  const charHit = useRef<boolean[]>(Array(WELCOME_TEXT.length).fill(false));

  // Game state
  const batPositionRef = useRef(0);
  const { gameState, setGameState } = useGame();
  const gameStateRef = useRef(gameState);

  // Custom hooks (physics engine doesn't need ballRef, gameStateRef, or ballDraggable)
  const ballAnimation = useBallAnimation({
    ballRef: ball,
    ballDraggable,
    charRefs,
    charHit,
    charVelocities,
    charPositions,
    batPositionRef,
    gameStateRef,
    welcomeAnimationComplete,
  });

  const batControls = useBatControls({
    batRef: bat,
    batPositionRef,
    gameStateRef,
  });

  // Launch ball function - wrapped in useCallback to prevent recreating
  const launchBall = useCallback(() => {
    if (!ball.current) return;

    setGameState("running");

    isAnimating.current = true;
    if (ballDraggable.current) {
      ballDraggable.current.disable();
    }

    // Launch with default velocity
    ballAnimation.animateBall({ x: 0, y: 0 }, { vx: 0, vy: -7 });
  }, [ballAnimation, setGameState]);

  const gameControls = useGameControls({
    gameStateRef,
    setGameState,
    welcomeAnimationComplete,
    launchBall,
    onKeyDown: batControls.handleKeyDown,
    onKeyUp: batControls.handleKeyUp,
  });

  // Sync gameState to ref
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Handle game reset - reset all game elements when game state changes to 'new'
  useEffect(() => {
    if (gameState === "new") {
      // Reset bat controls
      batControls.resetBatControls();

      // Reset ball animation
      ballAnimation.resetBallAnimation();

      // Reset animation state
      isAnimating.current = false;

      // Reset character states
      charHit.current.fill(false);
      charPositions.current = Array(WELCOME_TEXT.length)
        .fill(null)
        .map(() => ({ x: 0, y: 0, rotation: 0 }));
      charVelocities.current = Array(WELCOME_TEXT.length)
        .fill(null)
        .map(() => ({ vx: 0, vy: 0, vr: 0 }));

      // Reset character visual positions
      charRefs.current.forEach((charEl) => {
        if (charEl) {
          charEl.style.transform = "translate(0px, 0px)";
        }
      });
    }
  }, [gameState, batControls, ballAnimation]);

  // Show bat when game starts
  useEffect(() => {
    if (gameState === "running") {
      batControls.showBat();
    }
  }, [gameState, batControls]);

  // Initial animations setup
  useEffect(() => {
    if (!root.current) return;

    scope.current = createScope({ root: root.current }).add(() => {
      // Ball animation
      if (ball.current) {
        // Initial scale-in animation
        animate(ball.current, {
          scale: [
            {
              from: 40,
              to: 0,
              ease: spring({ bounce: 0.2, duration: 500 }),
            },
            {
              from: 0,
              to: 1,
              // ease: spring({ bounce: 0.1, duration: 300 }),
              ease: "easeInOut",
              delay: 3000,
            },
          ],
          onComplete: () => {
            if (!isAnimating.current && ball.current) {
              animate(ball.current, {
                scale: [1, 1.2],
                ease: "easeInOutSine",
                duration: 1000,
                alternate: true,
                loop: true,
              });
            }
          },
        });

        ballDraggable.current = createDraggable(ball.current, {
          container: [0, 0, 0, 0],
          onGrab: (draggable) => {
            if (ballAnimation.animationFrame.current) {
              cancelAnimationFrame(ballAnimation.animationFrame.current);
              ballAnimation.animationFrame.current = null;
            }
            isAnimating.current = false;
            dragStart.current = { x: draggable.x, y: draggable.y };
          },
          onRelease: (draggable) => {
            dragEnd.current = { x: draggable.x, y: draggable.y };
            setGameState("running");

            const velocity = ballAnimation.calculateLaunchVelocity(
              dragStart.current,
              dragEnd.current,
            );

            isAnimating.current = true;
            if (ballDraggable.current) {
              ballDraggable.current.disable();
            }

            if (isDeepEqual(velocity, { vx: 0, vy: 0 })) {
              ballAnimation.animateBall(dragEnd.current, {
                vx: 0,
                vy: -7,
              });
              return;
            }
            ballAnimation.animateBall(dragEnd.current, velocity);
          },
        });

        // Initially disable dragging
        if (ballDraggable.current) {
          ballDraggable.current.disable();
        }
      }

      // Intro typing effect
      if (intro.current) {
        animate(intro.current, {
          innerHTML: scrambleText({
            text: INTRO_TEXT,
            cursor: "█",
            override: " ",
            duration: ANIMATION_TIMINGS.INTRO_DURATION,
            delay: ANIMATION_TIMINGS.INTRO_DELAY,
          }),
        });
      }

      // Character fade-in animation
      charRefs.current.forEach((charEl, index) => {
        if (charEl) {
          animate(charEl, {
            opacity: {
              from: 0,
              to: 1,
              duration: ANIMATION_TIMINGS.CHAR_DURATION,
              delay:
                ANIMATION_TIMINGS.CHAR_START +
                index * ANIMATION_TIMINGS.CHAR_DELAY,
            },
          });
        }
      });
    });

    // Enable dragging after welcome animation
    const enableDraggingTimer = setTimeout(() => {
      welcomeAnimationComplete.current = true;
      if (ballDraggable.current) {
        ballDraggable.current.enable();
      }
    }, ANIMATION_TIMINGS.WELCOME_COMPLETE);

    return () => {
      scope.current?.revert();
      if (ballAnimation.animationFrame.current) {
        cancelAnimationFrame(ballAnimation.animationFrame.current);
      }
      clearTimeout(enableDraggingTimer);
    };
    // ballAnimation and setGameState are stable, but eslint doesn't know
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Event listeners for controls - these handlers are stable
  useEffect(() => {
    const { handleKeyDown, handleKeyUp } = gameControls;
    const {
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      batAnimationFrame,
    } = batControls;

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
    // Only re-run if the handler functions actually change (they're stable via useCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main
      ref={root}
      className='relative z-10 h-full flex flex-col pointer-events-none'
    >
      <div className='flex items-center justify-center pt-4'>
        <p ref={intro} className='text-green-400 font-mono text-lg mb-2' />
      </div>

      <div className='grid place-items-center mt-52'>
        <AnimatedText
          text={WELCOME_TEXT}
          charRefs={charRefs}
          className='text-3xl max-md:text-2xl text-green-400 font-mono font-bold tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] relative'
        />
      </div>

      <Ball ref={ball} />
      <Bat ref={bat} />
    </main>
  );
};

export default Home;
