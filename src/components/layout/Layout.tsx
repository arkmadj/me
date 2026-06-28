import { animate, stagger } from "animejs";
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import SplashScreen from "@/components/common/SplashScreen";
import Navigation from "@/components/common/Navigation";
import GameOverlay from "@/components/common/GameOverlay";
import { GameProvider, useGame } from "@/context";

const LayoutContent = () => {
  const cursorTracker = useRef(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorTracker.current) {
        animate(cursorTracker.current, {
          left: e.clientX,
          top: e.clientY,
          ease: "out(3)",
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleCellClick = (index: number) => () => {
    const cells = cellRefs.current.filter((cell) => cell !== null);
    if (cells.length === 0) return;

    // Animate all cells with stagger based on grid position
    animate(cells, {
      keyframes: [
        {
          x: stagger("-.175rem", {
            grid: [gridSize.cols, gridSize.rows],
            from: index,
            axis: "x",
          }),
          y: stagger("-.175rem", {
            grid: [gridSize.cols, gridSize.rows],
            from: index,
            axis: "y",
          }),
          duration: 200,
        },
        {
          x: stagger(".125rem", {
            grid: [gridSize.cols, gridSize.rows],
            from: index,
            axis: "x",
          }),
          y: stagger(".125rem", {
            grid: [gridSize.cols, gridSize.rows],
            from: index,
            axis: "y",
          }),
          scale: 1.5,
          duration: 500,
        },
        {
          x: 0,
          y: 0,
          scale: 1,
          duration: 600,
        },
      ],
      delay: stagger(50, {
        grid: [gridSize.cols, gridSize.rows],
        from: index,
      }),
    });
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className='h-svh w-full bg-[#0a0f0a] relative overflow-hidden isolate overscroll-none'>
      {/* Cursor tracking glow effect */}
      <div
        ref={cursorTracker}
        className='absolute pointer-events-none z-0 w-0 h-0'
      >
        <div className='absolute -translate-x-1/2 -translate-y-1/2 bg-green-500 size-96 rounded-full blur-3xl opacity-60' />
        <div className='absolute -translate-x-1/2 -translate-y-1/2 bg-green-400 size-64 rounded-full blur-2xl opacity-50' />
        <div className='absolute -translate-x-1/2 -translate-y-1/2 bg-green-300 size-40 rounded-full blur-xl opacity-40' />
      </div>

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
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            className='aspect-square bg-black border border-green-950/30'
            onClick={handleCellClick(i)}
          />
        ))}
      </div>

      {/* Overlay */}
      {(gameState === "paused" || gameState === "over" || gameState === "running") && <GameOverlay />}
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
