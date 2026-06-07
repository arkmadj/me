import { animate } from "animejs";
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import SplashScreen from "@/components/common/SplashScreen";
import Navigation from "@/components/common/Navigation";

const Layout = () => {
  const root = useRef(null);
  const cursorTracker = useRef(null);
  const [gridSize, setGridSize] = useState({ cols: 24, rows: 24 });
  const [showSplash, setShowSplash] = useState(false);

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

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div
      ref={root}
      className='h-svh w-full bg-[#0a0f0a] relative overflow-hidden isolate'
    >
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
            className='aspect-square bg-black border border-green-950/30'
          />
        ))}
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Main content area - rendered by React Router */}
      <Outlet />
    </div>
  );
};

export default Layout;
