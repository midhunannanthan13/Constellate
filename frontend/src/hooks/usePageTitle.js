import { useEffect } from 'react';

/**
 * Updates document.title for screen readers and browser tabs on route change.
 */
export default function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — Constellate` : 'Constellate — Your habits, written in stars';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
