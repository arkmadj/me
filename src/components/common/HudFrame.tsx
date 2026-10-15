import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useGame } from "@/context";
import { GLOW_DOT } from "@/components/ui/pill";

const LAGOS_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

// Ticks every second, so it lives in its own component to keep Home from re-rendering
const LagosClock = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return <time dateTime={now.toISOString()}>{LAGOS_TIME.format(now)} WAT</time>;
};

const Corner = ({ className }: { className: string }) => (
  <span className={cn("absolute size-5 border-green-400/50", className)} />
);

const LABEL = "absolute max-md:hidden font-mono text-[10px] tracking-[0.3em] uppercase text-green-500/60";

// Decorative terminal frame around the screen (home intro and the pause menu)
export const HudFrame = ({ visible }: { visible: boolean }) => {
  const { bestScore } = useGame();

  return (
    <div
      aria-hidden='true'
      className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-700",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div className='absolute inset-0 animate-fade-in [animation-delay:400ms]'>
        <Corner className='top-4 left-4 border-t border-l' />
        <Corner className='top-4 right-4 border-t border-r' />
        <Corner className='bottom-4 left-4 border-b border-l' />
        <Corner className='bottom-4 right-4 border-b border-r' />

        <span className={cn(LABEL, "top-5 left-12")}>
          <span className='text-green-300'>➜</span> ahmad@lagos:~
        </span>
        <span className={cn(LABEL, "top-5 right-12 flex items-center gap-2")}>
          <span className={GLOW_DOT} />
          <LagosClock />
        </span>
        <span className={cn(LABEL, "bottom-5 left-12")}>6.52°N · 3.38°E</span>
        <span className={cn(LABEL, "bottom-5 right-12")}>
          hi-score {String(bestScore).padStart(4, "0")}
        </span>
      </div>
    </div>
  );
};
