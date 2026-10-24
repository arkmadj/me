import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SplashScreen from "@/components/common/SplashScreen";
import Navigation from "@/components/common/Navigation";
import GameOverlay from "@/components/common/GameOverlay";
import { GameProvider, useGame } from "@/context";
import { prefersReducedMotion } from "@/hooks/useReveal";
import { usePageMeta } from "@/hooks/usePageMeta";

// Each cell: 1px border on a black fill, with a 1px gap between neighbours
const CELL_BORDER = "rgb(3 46 21 / 0.3)";
const CELL_GAP = "#0a0f0a";
const gridLines = (direction: "right" | "bottom") =>
  `linear-gradient(to ${direction}, ${CELL_BORDER} 0 1px, transparent 1px calc(100% - 2px), ${CELL_BORDER} calc(100% - 2px) calc(100% - 1px), ${CELL_GAP} calc(100% - 1px))`;
const GRID_BACKGROUND = `${gridLines("right")}, ${gridLines("bottom")}`;

// Crawlers should index the page, not a 3.5s splash animation
const isCrawler = () => /bot|crawl|spider|slurp|lighthouse|facebookexternalhit|embedly|preview/i.test(navigator.userAgent);

const LayoutContent = () => {
  const [cellSize, setCellSize] = useState(50);
  const [showSplash, setShowSplash] = useState(() => !prefersReducedMotion() && !isCrawler());
  const { gameState } = useGame();
  usePageMeta();

  useEffect(() => {
    const calculateGrid = () => {
      const minCellSize = 50; // Minimum cell size in pixels
      // Stretch cells so whole columns fill the viewport width
      const cols = Math.max(1, Math.floor(window.innerWidth / minCellSize));
      setCellSize(window.innerWidth / cols);
    };

    calculateGrid();
    window.addEventListener("resize", calculateGrid);
    return () => window.removeEventListener("resize", calculateGrid);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className='h-svh supports-[height:100dvh]:h-dvh w-full bg-[#0a0f0a] relative overflow-hidden isolate overscroll-none'>
      {/* Background grid */}
      <div
        className='absolute inset-0 z-10 bg-black'
        style={{
          backgroundImage: GRID_BACKGROUND,
          backgroundSize: `${cellSize}px ${cellSize}px`,
        }}
      />

      {/* Overlay */}
      {["paused", "over", "running", "won"].includes(gameState) && <GameOverlay />}
      {/* Main content area - rendered by React Router; the only part that animates between routes */}
      <div className="relative z-10 h-full [view-transition-name:page]">
        <Outlet />
      </div>
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
