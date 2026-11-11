import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

// Define your routes configuration
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // Add more routes here as needed
      {
        path: 'about',
        // Code-split: Home (the game) shouldn't ship About's code or the GitHub stats JSON
        lazy: async () => ({ Component: (await import('@/pages/About')).default }),
      },
      {
        path: 'projects',
        lazy: async () => ({ Component: (await import('@/pages/Projects')).default }),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  // Add routes outside of the main layout if needed
  // {
  //   path: '/login',
  //   element: <Login />,
  // },
];

// Create the router instance
export const router = createBrowserRouter(routes);
