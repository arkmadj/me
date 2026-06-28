/**
 * Centralized route paths for type-safe navigation
 * Add new routes here as you expand your application
 */
export const ROUTES = {
  HOME: '/',
  // Add more routes here as needed
  ABOUT: '/about',
  PROJECTS: '/projects',
  // CONTACT: '/contact',
  // BLOG: '/blog',
  // PROJECT_DETAIL: (id: string) => `/projects/${id}`,
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];
