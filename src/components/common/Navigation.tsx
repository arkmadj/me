import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import { ROUTES } from '@/routes/paths';
import { useGame } from '@/context';
import { prefersReducedMotion } from '@/hooks/useReveal';
import { GLOW_DOT, KEYCAP, PILL } from '@/components/ui/pill';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();
  const { gameState, resetGame } = useGame();
  const navRef = useRef<HTMLElement>(null);
  const navItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const previousGameState = useRef(gameState);

  const navItems = [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.ABOUT, label: 'About' },
    { path: ROUTES.PROJECTS, label: 'Projects' },
  ];

  // Reusable animation function
  const animateNavItems = useCallback((show: boolean) => {
    const items = navItemRefs.current.filter((item) => item !== null);
    if (items.length === 0) return;

    if (prefersReducedMotion()) {
      items.forEach((item) => {
        item.style.opacity = show ? '1' : '0';
        item.style.transform = 'none';
      });
      return;
    }

    const config = show
      ? {
          opacity: { to: 1, duration: 400 },
          translateY: { to: 0, duration: 400, ease: 'out(3)' },
          delay: stagger(80),
        }
      : {
          opacity: { to: 0, duration: 300 },
          translateY: { to: 20, duration: 300, ease: 'in(3)' },
          delay: stagger(40, { from: 'last' }),
        };

    animate(items, config);
  }, []);

  // Initial entry animation on mount
  useEffect(() => {
    const items = navItemRefs.current.filter((item) => item !== null);
    if (items.length === 0) return;

    // Set initial state: hidden
    items.forEach((item) => {
      if (item) {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
      }
    });

    // Animate in
    animateNavItems(true);
  }, [animateNavItems]);

  // Handle game state changes (hide/show based on running state)
  useEffect(() => {
    const isRunning = gameState === 'running';
    const wasRunning = previousGameState.current === 'running';

    // Only animate if the running state changed
    if (isRunning !== wasRunning) {
      animateNavItems(!isRunning);
    }

    previousGameState.current = gameState;
  }, [gameState, animateNavItems]);


  return (
    // Hidden during play, so it must not catch taps meant for the paddle
    <nav
      ref={navRef}
      inert={gameState === 'running'}
      className={`fixed bottom-0 left-0 right-0 z-50 p-6 ${gameState === 'running' ? 'pointer-events-none' : ''}`}
    >
      {/* Fades with its items so an empty pill isn't left behind during play */}
      <ul
        className={cn(
          PILL,
          'mx-auto w-fit gap-1 p-1 max-md:text-xs transition-opacity duration-500',
          gameState === 'running' && 'opacity-0',
        )}
      >
        {navItems.map((item, index) => (
          <li
            key={item.path}
            ref={(el) => {
              navItemRefs.current[index] = el;
            }}
          >
            <Link
              to={item.path}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 max-md:py-2 transition-colors duration-300',
                location.pathname === item.path
                  ? KEYCAP
                  : 'rounded-full border border-transparent hover:bg-green-400/10 hover:text-green-300',
              )}
              onClick={resetGame}
            >
              {location.pathname === item.path && <span className={GLOW_DOT} />}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
