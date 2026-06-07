import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: ROUTES.HOME, label: 'Home' },
    // Add more navigation items as you create pages
    // { path: ROUTES.ABOUT, label: 'About' },
    // { path: ROUTES.PROJECTS, label: 'Projects' },
  ];

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 p-6'>
      <ul className='flex gap-6 justify-center'>
        {navItems.map((item) => (
          <li key={item.path}>
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
