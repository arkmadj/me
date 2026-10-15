import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { absoluteUrl, getPageMeta } from '@/seo';

const setContent = (selector: string, value: string) =>
  document.head.querySelector(selector)?.setAttribute('content', value);

/** Keeps <head> in step with the route; the build prerenders the same values. */
export const usePageMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = getPageMeta(pathname);
    document.title = page.title;
    setContent('meta[name="description"]', page.description);
    setContent('meta[property="og:title"]', page.title);
    setContent('meta[property="og:description"]', page.description);
    setContent('meta[property="og:url"]', absoluteUrl(page.path));
    setContent('meta[name="twitter:title"]', page.title);
    setContent('meta[name="twitter:description"]', page.description);
    document.head.querySelector('link[rel="canonical"]')?.setAttribute('href', absoluteUrl(page.path));
  }, [pathname]);
};
