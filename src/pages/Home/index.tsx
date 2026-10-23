import { useEffect, useRef, useCallback, useState } from "react";
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
import { Backdrop } from "@/components/common/Backdrop";
import { Ball } from "./components/Ball";
import { Bat } from "./components/Bat";
import { ScorePopups, type ScorePopup } from "./components/ScorePopups";
import { isDeepEqual } from "@/lib/utils";
import { useSound } from "@/hooks/useSound";
import { prefersReducedMotion } from "@/hooks/useReveal";
import { PROFILE } from "@/pages/About/data";
import { RotatingText } from "@/components/ui/RotatingText";
import { GLOW_DOT, PILL } from "@/components/ui/pill";
import { Kbd } from "@/components/ui/Kbd";
import { HudFrame } from "@/components/common/HudFrame";

const HINT_PILL = `${PILL} absolute left-1/2 -translate-x-1/2 transition-opacity duration-700`;

const Home = () => {
  // Refs for DOM elements
  const root = useRef<HTMLDivElement | null>(null);
  const intro = useRef<HTMLParagraphElement | null>(null);
  const tagline = useRef<HTMLParagraphElement | null>(null);
  const ball = useRef<HTMLDivElement | null>(null);
  const bat = useRef<HTMLDivElement | null>(null);

  // Refs for animation state
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const ballDraggable = useRef<ReturnType<typeof createDraggable> | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragEnd = useRef({ x: 0, y: 0 });
  const isAnimating = useRef(false);
  const welcomeAnimationComplete = useRef(false);
  const pulseAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const [showPlayHint, setShowPlayHint] = useState(false);
  const [showControlsHint, setShowControlsHint] = useState(false);
  const controlsHintShown = useRef(false);
  const controlsHintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const nextPopupId = useRef(0);
  const [isTouchDevice] = useState(
    () => window.matchMedia("(pointer: coarse)").matches,
  );

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
  const charLanded = useRef<boolean[]>(Array(WELCOME_TEXT.length).fill(false));

  // Game state
  const batPositionRef = useRef(0);
  const { gameState, setGameState, decrementLives, incrementScore, mutedSound } = useGame();
  const gameStateRef = useRef(gameState);

  // Sound effects
  const { playCharacterHit, playBallMiss, playCharacterLand, playGameOver, playVictory } = useSound({ muted: mutedSound });

  // Show a floating "+N" at the given character's current position
  const showScorePopup = useCallback(
    (index: number, points: number, kind: ScorePopup["kind"]) => {
      const charEl = charRefs.current[index];
      if (!charEl || !root.current) return;
      const charRect = charEl.getBoundingClientRect();
      const rootRect = root.current.getBoundingClientRect();
      const popup: ScorePopup = {
        id: nextPopupId.current++,
        x: charRect.left + charRect.width / 2 - rootRect.left,
        // Catches float up from the top of the bat rather than the char's centre
        y: (kind === "catch" ? charRect.top : charRect.top + charRect.height / 2) - rootRect.top,
        points,
        kind,
      };
      setScorePopups((popups) => [...popups, popup]);
    },
    [],
  );

  const removeScorePopup = useCallback((id: number) => {
    setScorePopups((popups) => popups.filter((popup) => popup.id !== id));
  }, []);

  // Handler for when ball hits bottom
  const handleBallHitBottom = useCallback(() => {
    playBallMiss();
    decrementLives();
    setGameState("restart");
  }, [decrementLives, setGameState, playBallMiss]);

  // Handler for when character is hit
  const handleCharacterHit = useCallback((index: number) => {
    incrementScore(10);
    showScorePopup(index, 10, "hit");
    playCharacterHit();
  }, [incrementScore, playCharacterHit, showScorePopup]);

  // Handler for when character hits bat or bottom - checks win condition
  const handleCharacterLanded = useCallback(() => {
    // Check if ALL non-space characters have landed (either hit bat or bottom)
    const allCharactersLanded = charLanded.current.every((landed, i) => {
      // Skip space characters - they can't be hit by the ball
      if (WELCOME_TEXT[i] === ' ') return true;
      return landed;
    });

    if (allCharactersLanded) {
      setGameState("won");
    }
  }, [setGameState]);

  // Handler for when character hits bat
  const handleCharacterHitBat = useCallback((index: number) => {
    playCharacterLand();
    incrementScore(5);
    showScorePopup(index, 5, "catch");
    handleCharacterLanded();
  }, [incrementScore, handleCharacterLanded, playCharacterLand, showScorePopup]);

  // Handler for when character hits bottom
  const handleCharacterHitBottom = useCallback(() => {
    handleCharacterLanded();
  }, [handleCharacterLanded]);

  // Custom hooks (physics engine doesn't need ballRef, gameStateRef, or ballDraggable)
  const ballAnimation = useBallAnimation({
    ballRef: ball,
    ballDraggable,
    charRefs,
    charHit,
    charLanded,
    charVelocities,
    charPositions,
    batPositionRef,
    gameStateRef,
    welcomeAnimationComplete,
    muted: mutedSound,
    onBallHitBottom: handleBallHitBottom,
    onCharacterHit: handleCharacterHit,
    onCharacterHitBat: handleCharacterHitBat,
    onCharacterHitBottom: handleCharacterHitBottom,
  });

  const batControls = useBatControls({
    batRef: bat,
    batPositionRef,
    gameStateRef,
  });

  // Show bat controls hint briefly on the first launch only
  const revealControlsHint = useCallback(() => {
    if (controlsHintShown.current) return;
    controlsHintShown.current = true;
    setShowControlsHint(true);
    controlsHintTimer.current = setTimeout(() => {
      setShowControlsHint(false);
    }, ANIMATION_TIMINGS.CONTROLS_HINT_DURATION);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsHintTimer.current) clearTimeout(controlsHintTimer.current);
    };
  }, []);

  // Launch ball function - wrapped in useCallback to prevent recreating
  const launchBall = useCallback(() => {
    if (!ball.current) return;

    setGameState("running");
    revealControlsHint();

    isAnimating.current = true;
    if (ballDraggable.current) {
      ballDraggable.current.disable();
    }

    // Launch with default velocity
    ballAnimation.animateBall({ x: 0, y: 0 }, { vx: 0, vy: -7 });
  }, [ballAnimation, setGameState, revealControlsHint]);

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

  // Handle game reset - reset all game elements when game state changes to 'new' or 'restart'
  useEffect(() => {
    if (gameState === "new" || gameState === "restart") {
      // Reset bat controls
      batControls.resetBatControls();

      // Reset ball animation
      ballAnimation.resetBallAnimation();

      // Reset animation state
      isAnimating.current = false;

      if (gameState === "new") {
        // Reset character states
        charHit.current.fill(false);
        charLanded.current.fill(false);
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
    }
  }, [gameState, batControls, ballAnimation]);

  // Show bat when game starts
  useEffect(() => {
    if (gameState === "running") {
      batControls.showBat();
    }
  }, [gameState, batControls]);

  // Stop pulse animation when game starts
  useEffect(() => {
    if (gameState === "running" && pulseAnimation.current) {
      pulseAnimation.current.cancel();
      pulseAnimation.current = null;
      // Reset ball scale to 1
      if (ball.current) {
        ball.current.style.transform = ball.current.style.transform.replace(/scale\([^)]*\)/, 'scale(1)');
      }
    }
  }, [gameState]);

  // Play game over sound when game ends
  useEffect(() => {
    if (gameState === "over") {
      playGameOver();
    }
  }, [gameState, playGameOver]);

  // Play victory sound when game is won
  useEffect(() => {
    if (gameState === "won") {
      playVictory();
    }
  }, [gameState, playVictory]);

  // Initial animations setup
  useEffect(() => {
    if (!root.current) return;
    const reduceMotion = prefersReducedMotion();

    scope.current = createScope({ root: root.current }).add(() => {
      // Ball animation
      if (ball.current) {
        // Initial scale-in animation (skipped for reduced motion: ball stays put)
        if (!reduceMotion) animate(ball.current, {
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
              pulseAnimation.current = animate(ball.current, {
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
            revealControlsHint();

            const velocity = ballAnimation.calculateLaunchVelocity(
              dragStart.current,
              dragEnd.current,
            );

            isAnimating.current = true;
            if (ballDraggable.current) {
              ballDraggable.current.disable();
            }

            // if the ball is tapped
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

      // Reduced motion: show all intro content immediately
      if (reduceMotion) {
        if (intro.current) intro.current.textContent = INTRO_TEXT;
        if (tagline.current) tagline.current.style.opacity = "1";
        charRefs.current.forEach((charEl) => {
          if (charEl) charEl.style.opacity = "1";
        });
        return;
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

      // Tagline fades in once the intro has finished typing
      if (tagline.current) {
        animate(tagline.current, {
          opacity: { from: 0, to: 1 },
          duration: 600,
          delay: ANIMATION_TIMINGS.INTRO_DELAY + ANIMATION_TIMINGS.INTRO_DURATION,
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
      setShowPlayHint(true);
      if (ballDraggable.current) {
        ballDraggable.current.enable();
      }
    }, reduceMotion ? 0 : ANIMATION_TIMINGS.WELCOME_COMPLETE);

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
      <Backdrop />
      <HudFrame visible={gameState === "new"} />

      <div className='flex flex-col items-center justify-center pt-8 max-md:pt-6'>
        {/* Scrambled while typing, so screen readers get the plain text instead */}
        <p
          ref={intro}
          aria-hidden='true'
          className={`font-mono text-xl max-md:text-base mb-2 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)] ${gameState === "new" ? "text-green-300" : "text-transparent"}`}
        />
        <h1 className='sr-only'>{INTRO_TEXT}</h1>
        <p
          ref={tagline}
          className={`font-mono text-sm max-md:text-xs tracking-wider opacity-0 transition-colors duration-300 ${gameState === "new" ? "text-green-500/80" : "text-transparent"}`}
        >
          {PROFILE.role} <span className={gameState === "new" ? "text-green-700" : ""}>//</span>{" "}
          <RotatingText
            items={PROFILE.focuses}
            active={gameState === "new"}
            className={gameState === "new" ? "text-cyan-300" : ""}
          />
        </p>
      </div>

      <div className='grid place-items-center mt-[clamp(5rem,22vh,13rem)] max-md:mt-20'>
        <AnimatedText
          text={WELCOME_TEXT}
          charRefs={charRefs}
          className='text-5xl max-lg:text-4xl max-md:text-2xl text-green-400 font-mono font-bold tracking-wider drop-shadow-[0_0_14px_rgba(34,197,94,0.65)] relative'
        />
      </div>

      <Ball ref={ball} />
      <ScorePopups popups={scorePopups} onDone={removeScorePopup} />

      {/* Play hint - shown once the ball is ready to launch */}
      <div
        className={`${HINT_PILL} top-1/2 mt-10 ${
          showPlayHint && (gameState === "new" || gameState === "restart")
            ? "opacity-100"
            : "opacity-0"
        }`}
        aria-live='polite'
      >
        <span className={GLOW_DOT} />
        {isTouchDevice ? (
          "tap or flick the ball to play"
        ) : (
          <span>
            press <Kbd>space</Kbd> or drag the ball to play
          </span>
        )}
      </div>

      {/* Controls hint - shown above the bat right after the first launch */}
      <div
        className={`${HINT_PILL} bottom-16 ${
          showControlsHint && gameState === "running" ? "opacity-100" : "opacity-0"
        }`}
        aria-live='polite'
      >
        {isTouchDevice ? (
          "drag anywhere to move the paddle"
        ) : (
          <span>
            use <Kbd>←</Kbd>
            <Kbd>→</Kbd> to move the paddle
          </span>
        )}
      </div>
      <Bat ref={bat} />
    </main>
  );
};

export default Home;
