import { Link, useLocation } from 'react-router-dom';
import { useEffect, useRef, useCallback } from 'react';
import { animate, stagger } from 'animejs';
import { ROUTES } from '@/routes/paths';
import { useGame } from '@/context';

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
    <nav ref={navRef} className='fixed bottom-0 left-0 right-0 z-50 p-6'>
      <ul className='flex gap-6 justify-center'>
        {navItems.map((item, index) => (
          <li
            key={item.path}
            ref={(el) => {
              navItemRefs.current[index] = el;
            }}
          >
            <Link
              to={item.path}
              className={`
                text-green-400 font-mono text-sm tracking-wider
                transition-all duration-300 hover:text-green-300
                hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]
                ${location.pathname === item.path
                  ? 'drop-shadow-[0_0_8px_rgba(34,197,94,0.8)] font-bold'
                  : ''
                }
              `}
              onClick={resetGame}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
