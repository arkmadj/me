import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import RouteError from '@/pages/RouteError';

// Define your routes configuration
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    // Layout itself failed: nothing to render inside, so take over the viewport
    errorElement: <RouteError fullscreen />,
    children: [
      {
        // Pathless boundary: a page crash renders inside Layout, so navigation keeps working
        errorElement: <RouteError />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: 'about',
            // Code-split: Home (the game) shouldn't ship About's code or the GitHub stats JSON
            lazy: async () => ({
              Component: (await import('@/pages/About')).default,
            }),
          },
          {
            path: 'projects',
            lazy: async () => ({
              Component: (await import('@/pages/Projects')).default,
            }),
          },
          {
            path: '*',
            element: <NotFound />,
          },
        ],
      },
    ],
  },
];

// Create the router instance
export const router = createBrowserRouter(routes);
