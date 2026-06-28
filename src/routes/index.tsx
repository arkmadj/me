import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import About from '@/pages/About';
import Projects from '@/pages/Projects';

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
        element: <About />,
      },
      {
        path: 'projects',
        element: <Projects />,
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
