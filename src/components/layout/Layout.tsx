import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SplashScreen from "@/components/common/SplashScreen";
import Navigation from "@/components/common/Navigation";
import GameOverlay from "@/components/common/GameOverlay";
import { GameProvider, useGame } from "@/context";

const LayoutContent = () => {
  const [gridSize, setGridSize] = useState({ cols: 24, rows: 24 });
  const [showSplash, setShowSplash] = useState(true);
  const { gameState } = useGame();

  useEffect(() => {
    const calculateGrid = () => {
      const minCellSize = 50; // Minimum cell size in pixels
      const cols = Math.floor(window.innerWidth / minCellSize);
      const rows = Math.floor(window.innerHeight / minCellSize);
      setGridSize({ cols, rows });
    };

    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className='h-svh w-full bg-[#0a0f0a] relative overflow-hidden isolate overscroll-none'>
      {/* Background grid */}
      <div
        className='absolute inset-0 grid gap-px z-10'
        style={{
          gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize.cols * gridSize.rows }).map((_, i) => (
          <div
            key={i}
            className='aspect-square bg-black border border-green-950/30'
            // onClick={handleCellClick(i)}
          />
        ))}
      </div>

      {/* Overlay */}
      {["paused", "over", "running", "won"].includes(gameState) && <GameOverlay />}
      {/* Main content area - rendered by React Router */}
      <Outlet />
      {/* Navigation */}
      <Navigation />
    </div>
  );
};

const Layout = () => {
  return (
    <GameProvider>
      <LayoutContent />
    </GameProvider>
  );
};

export default Layout;
