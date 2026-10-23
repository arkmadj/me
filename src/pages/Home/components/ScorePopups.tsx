export interface ScorePopup {
  id: number;
  x: number;
  y: number;
  points: number;
  kind: "hit" | "catch";
}

interface ScorePopupsProps {
  popups: ScorePopup[];
  onDone: (id: number) => void;
}

const KIND_STYLES: Record<ScorePopup["kind"], string> = {
  hit: "text-2xl max-md:text-xl text-green-300 drop-shadow-[0_0_10px_rgba(74,222,128,0.9)]",
  catch: "text-xl max-md:text-lg text-cyan-300 drop-shadow-[0_0_10px_rgba(103,232,249,0.9)]",
};

// Floating "+N" markers shown where points were earned
export const ScorePopups = ({ popups, onDone }: ScorePopupsProps) => {
  return (
    <div aria-hidden='true' className='absolute inset-0 overflow-hidden pointer-events-none'>
      {popups.map((popup) => (
        <span
          key={popup.id}
          className={`absolute -translate-x-1/2 -translate-y-1/2 font-mono font-bold animate-score-pop ${KIND_STYLES[popup.kind]}`}
          style={{ left: popup.x, top: popup.y }}
          onAnimationEnd={() => onDone(popup.id)}
        >
          +{popup.points}
        </span>
      ))}
    </div>
  );
};
