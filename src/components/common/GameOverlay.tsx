import Button from "@/components/ui/Button";
import { useGame } from "@/context";

const GameOverlay = () => {
  const { gameState, score, lives, setGameState, resetGame } = useGame();

  const handleStartGame = () => {
    setGameState("running");
  };

  const handleTryAgain = () => {
    resetGame();
    setGameState("running");
  };

  const handleClose = () => {
    resetGame();
    setGameState("new");
  };

  if (gameState === "over") {
    return (
      <main className='h-svh w-svw bg-black/50 backdrop-blur-xs absolute flex flex-col items-center justify-center gap-6 z-50'>
        <h1 className='text-5xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'>
          Game Over
        </h1>
        <div className='text-2xl text-green-400 font-mono'>Score: {score}</div>
        <div className="flex gap-6 max-md:flex-col max-md:gap-3">
          <Button onClick={handleTryAgain}>Try Again</Button>
          <Button onClick={handleClose}>Close Game</Button>
        </div>
      </main>
    );
  }

  if (gameState === "paused") {
    return (
      <main className='h-svh w-svw bg-black/50 backdrop-blur-xs absolute flex flex-col items-center justify-center gap-6 z-50'>
        <h1 className='text-5xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'>
          Paused
        </h1>
        <div className='text-2xl text-green-400 font-mono flex flex-col items-center gap-2'>
          <div>Score: {score}</div>
          <div>Lives: {lives}</div>
        </div>
        <Button onClick={handleStartGame}>Start Game</Button>
      </main>
    );
  }

  return null;
};

export default GameOverlay;
