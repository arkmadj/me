import React from "react";
import Button from "@/components/ui/button";

type Props = {
  type: "paused" | "over";
};

const GameOverlay = () => {
  return (
    <main className='h-svh w-svw bg-black/50 backdrop-blur-xs absolute flex flex-col items-center justify-center gap-6 z-50'>
      <h1 className="text-5xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">Game Over</h1>
      <Button>Try Again</Button>
    </main>
  );
};

export default GameOverlay;
