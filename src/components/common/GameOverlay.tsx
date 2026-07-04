import Button from "@/components/ui/Button";
import { useGame } from "@/context";
import {
  HeartFilledIcon,
  HeartIcon,
  PauseIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
} from "@radix-ui/react-icons";

const GameOverlay = () => {
  const {
    gameState,
    score,
    lives,
    mutedSound,
    setGameState,
    resetGame,
    toggleSound,
  } = useGame();

  const handleStartGame = () => {
    setGameState("running");
  };

  const handleTryAgain = () => {
    resetGame();
  };

  const handlePause = () => {
    setGameState("paused");
  };

  const handleToggleSound = () => {
    toggleSound();
  };

  if (gameState === "won") {
    return (
      <main className='h-full w-full bg-black/50 backdrop-blur-xs absolute flex flex-col items-center justify-center gap-6 z-50'>
        <h1 className='text-5xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'>
          You Won!
        </h1>
        <div className='text-2xl text-green-400 font-mono'>Score: {score}</div>
        <div className='flex gap-6 max-md:flex-col max-md:gap-3'>
          <Button onClick={handleTryAgain}>Play Again</Button>
        </div>
      </main>
    );
  }

  if (gameState === "over") {
    return (
      <main className='h-full w-full bg-black/50 backdrop-blur-xs absolute flex flex-col items-center justify-center gap-6 z-50'>
        <h1 className='text-5xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'>
          Game Over
        </h1>
        <div className='text-2xl text-green-400 font-mono'>Score: {score}</div>
        <div className='flex gap-6 max-md:flex-col max-md:gap-3'>
          <Button onClick={handleTryAgain}>Try Again</Button>
        </div>
      </main>
    );
  }

  if (gameState === "paused") {
    return (
      <main className='h-full w-full bg-black/50 backdrop-blur-xs absolute flex flex-col items-center justify-center gap-6 z-50'>
        <h1 className='text-5xl text-green-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]'>
          Paused
        </h1>
        <div className='text-2xl text-green-400 font-mono flex flex-col items-center gap-2'>
          <div>Score: {score}</div>
          <div>Lives: {lives}</div>
        </div>
        <div className='flex flex-col gap-4'>
          <Button onClick={handleStartGame}>Resume Game</Button>
          <Button className='w-full' onClick={handleTryAgain}>
            Reset Game
          </Button>
        </div>
      </main>
    );
  }

  if (gameState === "running") {
    return (
      <main className='h-full w-full absolute z-50 p-8 max-md:px-4'>
        <div className='flex justify-center items-center max-md:items-start gap-5'>
          <div className='flex-1 flex flex-col items-start gap-1'>
            <div className='flex justify-center items-center'>
              {Array.from({ length: lives }).map((_, i) => (
                <HeartFilledIcon
                  key={i}
                  className='size-10 max-md:size-5'
                  color='#05df72'
                />
              ))}
              {Array.from({ length: 3 - lives }).map((_, i) => (
                <HeartIcon
                  key={i}
                  className='size-10 max-md:size-5'
                  color='#05df72'
                />
              ))}
            </div>
            <p className='text-2xl text-green-400 font-mono max-md:text-lg'>
              Score: {score}
            </p>
          </div>
          <div className='flex gap-3'>
            <Button
              className='rounded-full p-1 border-2'
              onClick={handleToggleSound}
            >
              {mutedSound ? (
                <SpeakerOffIcon className='size-9 max-md:size-6' />
              ) : (
                <SpeakerLoudIcon className='size-9 max-md:size-6' />
              )}
            </Button>
            <Button className='rounded-full p-1 border-2' onClick={handlePause}>
              <PauseIcon className='size-9 max-md:size-6' />
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return null;
};

export default GameOverlay;
