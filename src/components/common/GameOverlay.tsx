import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { useGame } from "@/context";
import { ROUTES } from "@/routes/paths";
import { useNavigate } from "react-router-dom";
import {
  HeartFilledIcon,
  HeartIcon,
  PauseIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { GLOW_DOT, KEYCAP, PILL } from "@/components/ui/pill";
import { Kbd } from "@/components/ui/Kbd";
import { HudFrame } from "@/components/common/HudFrame";

const MAX_LIVES = 3;
const LABEL = "text-[10px] uppercase tracking-[0.3em] text-green-500/60";

const padScore = (value: number) => String(value).padStart(4, "0");

const Lives = ({ lives, className }: { lives: number; className?: string }) => (
  <span className='flex gap-0.5 text-green-400' aria-label={`${lives} of ${MAX_LIVES} lives left`}>
    {Array.from({ length: MAX_LIVES }, (_, i) =>
      i < lives ? (
        <HeartFilledIcon key={i} className={cn("drop-shadow-[0_0_4px_rgba(74,222,128,0.8)]", className)} />
      ) : (
        <HeartIcon key={i} className={cn("opacity-50", className)} />
      ),
    )}
  </span>
);

// Menu item styled like the nav links: the primary one is the active keycap with the glowing dot
const MenuButton = ({
  primary,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { primary?: boolean }) => (
  <button
    className={cn(
      "flex w-full items-center justify-center gap-2 px-4 py-2.5 uppercase tracking-widest transition-colors duration-300",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400/60",
      primary
        ? KEYCAP
        : "rounded-full border border-transparent text-green-400/90 hover:bg-green-400/10 hover:text-green-300",
      className,
    )}
    {...props}
  >
    {primary && <span className={GLOW_DOT} />}
    {children}
  </button>
);

const IconButton = ({ className, ...props }: ComponentProps<"button">) => (
  <button
    className={cn(
      "grid size-9 max-md:size-10 place-items-center rounded-full text-green-400 transition-colors duration-300",
      "hover:bg-green-400/10 hover:text-green-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-400/60",
      className,
    )}
    {...props}
  />
);

interface MenuScreenProps {
  status: string;
  title: string;
  frame?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}

const MenuScreen = ({ status, title, frame, hint, children }: MenuScreenProps) => {
  const { score, lives, bestScore, isNewBest } = useGame();

  return (
    <main
      role='dialog'
      aria-modal='true'
      aria-labelledby='game-menu-title'
      className='absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in [animation-duration:300ms]'
    >
      {frame && <HudFrame visible />}

      <section className='relative w-full max-w-sm overflow-hidden rounded-2xl border border-green-400/30 bg-black/70 font-mono shadow-[0_0_40px_rgba(34,197,94,0.15)] animate-pop-in'>
        <header className={cn(LABEL, "flex items-center gap-2 border-b border-green-400/20 bg-green-400/5 px-4 py-2.5")}>
          <span className={GLOW_DOT} />
          {status}
        </header>

        <div className='flex flex-col items-center gap-6 px-6 py-8 max-md:px-4'>
          <h1
            id='game-menu-title'
            className='text-4xl max-md:text-3xl font-bold uppercase tracking-widest text-green-400 drop-shadow-[0_0_14px_rgba(34,197,94,0.6)]'
          >
            {title}
          </h1>

          <dl className='grid w-full grid-cols-3 divide-x divide-green-400/20 rounded-xl border border-green-400/20 bg-green-400/5 py-3 text-center'>
            <div className='flex flex-col items-center gap-1.5'>
              <dt className={LABEL}>Score</dt>
              <dd className='text-lg leading-none text-green-300 tabular-nums'>{padScore(score)}</dd>
            </div>
            <div className='flex flex-col items-center gap-1.5'>
              <dt className={LABEL}>Lives</dt>
              <dd>
                <Lives lives={lives} className='size-4' />
              </dd>
            </div>
            <div className='flex flex-col items-center gap-1.5'>
              <dt className={cn(LABEL, isNewBest && score > 0 && "text-green-300 animate-pulse")}>
                {isNewBest && score > 0 ? "New best" : "Best"}
              </dt>
              <dd className='text-lg leading-none text-green-300 tabular-nums'>{padScore(bestScore)}</dd>
            </div>
          </dl>

          {/* Same glassy track as the bottom navigation */}
          <div className='flex w-full flex-col gap-1 rounded-3xl border border-green-400/30 bg-black/60 p-1 text-xs'>
            {children}
          </div>

          {hint && <p className={cn(LABEL, "flex items-center gap-1")}>{hint}</p>}
        </div>
      </section>
    </main>
  );
};

const GameOverlay = () => {
  const { gameState, score, lives, mutedSound, setGameState, resetGame, toggleSound } = useGame();
  const navigate = useNavigate();
  const [isTouchDevice] = useState(() => window.matchMedia("(pointer: coarse)").matches);

  const handleExploreWork = () => {
    resetGame();
    navigate(ROUTES.PROJECTS, { viewTransition: true });
  };

  if (gameState === "won" || gameState === "over") {
    const won = gameState === "won";
    return (
      <MenuScreen status={won ? "exit 0 · all clear" : "exit 1 · out of lives"} title={won ? "You Won!" : "Game Over"}>
        <MenuButton primary autoFocus onClick={resetGame}>
          {won ? "Play again" : "Try again"}
        </MenuButton>
        <MenuButton onClick={handleExploreWork}>Explore my work →</MenuButton>
      </MenuScreen>
    );
  }

  if (gameState === "paused") {
    return (
      <MenuScreen
        status='process suspended'
        title='Paused'
        frame
        hint={
          isTouchDevice ? undefined : (
            <>
              press <Kbd>esc</Kbd> to resume
            </>
          )
        }
      >
        <MenuButton primary autoFocus onClick={() => setGameState("running")}>
          Resume
        </MenuButton>
        <MenuButton onClick={resetGame}>Restart</MenuButton>
        <MenuButton onClick={handleExploreWork}>Explore my work →</MenuButton>
      </MenuScreen>
    );
  }

  if (gameState === "running") {
    return (
      // Only the controls take pointer events, so touches still reach the paddle
      <main className='absolute inset-0 z-50 p-6 max-md:p-4 pointer-events-none'>
        <div className='flex items-stretch justify-between gap-3'>
          <div className={cn(PILL, "gap-3 py-2 max-md:text-xs")}>
            <Lives lives={lives} className='size-4' />
            <span className='h-4 w-px bg-green-400/30' />
            <span>
              Score <span className='text-green-300 tabular-nums'>{padScore(score)}</span>
            </span>
          </div>

          <div className={cn(PILL, "gap-1 p-1 pointer-events-auto")}>
            <IconButton aria-label={mutedSound ? "Unmute sound" : "Mute sound"} onClick={toggleSound}>
              {mutedSound ? <SpeakerOffIcon className='size-5' /> : <SpeakerLoudIcon className='size-5' />}
            </IconButton>
            <IconButton aria-label='Pause game' onClick={() => setGameState("paused")}>
              <PauseIcon className='size-5' />
            </IconButton>
            {!isTouchDevice && (
              <span className='pr-2'>
                <Kbd>esc</Kbd>
              </span>
            )}
          </div>
        </div>
      </main>
    );
  }

  return null;
};

export default GameOverlay;
